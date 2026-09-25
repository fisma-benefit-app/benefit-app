# UpCloud Deployment Guide

This is how the whole app (Postgres, backend and frontend) was first deployed to an UpCloud Linux server with Docker Compose on 2026-09-25, written as steps you can repeat. At the end the app opens at `http://<server-ip>` and you can log in.

The [deployment guide](./deployment_guide.md#self-hosted-server-with-docker) describes the production Compose stack itself. This guide is the hands-on walkthrough, and the [lessons](#what-went-wrong-on-the-way) at the end explain the problems we hit along the way.

> **Warning:** the stack serves everything over plain HTTP, so passwords and tokens cross the network unencrypted. It's fine for a test server. Before real users log in, put a TLS reverse proxy (e.g. Caddy) in front of port 80.

## What you end up with

```
browser ──► :80  nginx (fisma_prod_frontend) ──► serves the frontend
                   └── /api/* ──► backend:8080 (fisma_prod_backend, 127.0.0.1 only)
                                    └──► db:5432 (fisma_prod_db, 127.0.0.1:5433 only)
```

- Only port 80 (and 22 for SSH) has to be open. The browser never talks to port 8080.
- Everything is built on the server from the repository, with `docker-compose.prod.yaml`.
- The database lives in the Docker volume `fisma-prod_pgdata`.

## Before you start

- **SSH access** to the server as `root` (or a user in the `docker` group).
- **`JWT_PRIVATE_KEY`** from the private `backend-credentials` repository. It must be the key that matches `backend/src/main/resources/jwt-keys/app.pub`. With any other key, login looks like it works but every request after it returns `401`.
- **UpCloud firewall** (control panel → Servers → your server → Firewall): ports 22 and 80 open for inbound TCP. If you don't have control panel access, ask someone who does. Nothing you do over SSH can change it.
- **Server size:** 2 vCPU / 4 GB RAM was plenty. The build peaks at around 3 GB of disk, so have **at least 4 GB free**. The first server had a 10 GB disk that was 94% full from earlier attempts. With 1 GB of RAM, add swap first or the Gradle build may be killed.
- **Software:** `git`, and Docker with the Compose plugin. On Ubuntu:

  ```bash
  apt-get update && apt-get install -y git docker.io docker-compose-v2
  ```

  The warning `Docker Compose is configured to build using Bake, but buildx isn't installed` is harmless.

All commands below run **on the server**, as root, from the repository at `/opt/benefit-app`.

## 1. Check the server

This doesn't change anything:

```bash
echo "== os"; . /etc/os-release; echo "$PRETTY_NAME"; nproc; free -h; swapon --show; df -h /; echo "== docker"; docker --version; docker compose version; docker ps -a; docker volume ls; echo "== repo"; git -C /opt/benefit-app status -sb; git -C /opt/benefit-app log --oneline -1; echo "== network"; ufw status; ss -tlnp | grep -E ':(22|80|443|5173|5432|5433|8080)\b'
```

Look for:

- **Free disk space** under `Avail`. You need 4 GB or more.
- **Leftover containers**, especially a database published on `0.0.0.0`. That database is open to the internet. The dev file `docker-compose.yaml` does this, so never run it on a server.
- **Local changes** in the repository (`M` lines under `== repo`).

## 2. Clean up earlier attempts (if any)

Skip this on a fresh server.

Check what an old database holds before deleting it. Our first attempt had created a dev database with only seed data, so it could go. Replace `<old_db_container>` with its name from `docker ps -a`:

```bash
docker exec <old_db_container> sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt" -c "select count(*) from app_users" -c "select count(*) from projects"'
```

Then remove the old containers and volumes, and free the disk. `docker system prune` deletes **every** unused image, stopped container, network and build cache on the machine, so only run it on a server used for nothing else:

```bash
cd /opt/benefit-app && git diff > /root/old-attempt.patch && git checkout -- . && docker rm -f <old containers> && docker volume rm <old named volumes> && docker system prune -af --volumes && rm -rf /root/.gradle /root/.npm && apt-get clean && df -h /
```

`git diff > /root/old-attempt.patch` keeps any local edits before `git checkout -- .` discards them. `/root/.gradle` and `/root/.npm` are caches left over from building on the host, and they're downloaded again if needed.

## 3. Get the code

On a new server:

```bash
git clone https://github.com/fisma-benefit-app/benefit-app.git /opt/benefit-app
```

On an existing one:

```bash
cd /opt/benefit-app && git switch main && git pull --ff-only && git log --oneline -1
```

## 4. Configure `.env`

Compose reads the root `.env`. Start from the example if there isn't one yet:

```bash
cd /opt/benefit-app && [ -f .env ] || cp .env.example .env
```

### 4a. Values

This sets the values the production stack needs, including a random database password. It backs up `.env` first and prints everything except the secrets. Replace `<server-ip>` with the server's address:

```bash
cd /opt/benefit-app && cp -p .env /root/env.bak && set_env() { if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else echo "$1=$2" >> .env; fi; } && set_env POSTGRES_PASSWORD "$(openssl rand -hex 24)" && set_env CORS_ALLOWED_ORIGINS http://<server-ip> && set_env HOST_HTTP_PORT 80 && set_env HOST_BACKEND_PORT 8080 && set_env HOST_DB_PORT 5433 && grep -E '^(POSTGRES_DB|POSTGRES_USER|CORS_ALLOWED_ORIGINS|HOST_[A-Z_]+)=' .env
```

- **`POSTGRES_PASSWORD`** only takes effect when the database volume is created. Changing it later doesn't change the password of an existing database.
- **`CORS_ALLOWED_ORIGINS`** must be exactly the address you type into the browser: scheme, host and port, no path. API calls go through nginx, but the backend still checks the browser's `Origin`. If this value is wrong, login fails with `403`.
- **`VITE_API_URL`** isn't used by this stack. The frontend calls the relative `/api`.

### 4b. The JWT key

In `backend-credentials` the key spans several lines inside double quotes:

```
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIE...
...
-----END PRIVATE KEY-----"
```

Compose reads it like that, so copy it **as is**. Don't join the lines by hand. If `.env` already has a `JWT_PRIVATE_KEY`, remove it first. This removes the whole block, even a broken one, and prints two zeros when nothing is left:

```bash
cd /opt/benefit-app && cp -p .env /root/env-before-jwt.bak && awk '/^JWT_PRIVATE_KEY=/{skip=1; if (/-----END/) skip=0; next} skip && (/^[A-Za-z_]+=/ || /^#/ || /^[[:space:]]*$/){skip=0} skip{if (/-----END/) skip=0; next} {print}' .env > .env.tmp && mv .env.tmp .env && grep -c '^JWT_PRIVATE_KEY=' .env; grep -c -- '-----' .env
```

Then append the key without opening an editor:

1. Run `cat >> /opt/benefit-app/.env`.
2. Paste the whole block with your terminal's paste shortcut.
3. Press Enter, then Ctrl+D.

The key doesn't end up in your shell history this way.

If you use an editor such as `micro` or `nano` instead, paste with the **terminal's** shortcut: Ctrl+Shift+V or right-click in Windows Terminal, right-click in PuTTY. Inside micro, Ctrl+V pastes from micro's own clipboard, which is empty on a server.

### 4c. Check the key and `.env`

This checks the key against `app.pub` and makes sure Compose can parse `.env`. It prints no secrets:

```bash
cd /opt/benefit-app && echo "JWT lines: $(grep -c '^JWT_PRIVATE_KEY=' .env), key block: $(awk '/^JWT_PRIVATE_KEY=/{f=1} f{n++; if(/-----END/) exit} END{print n+0}' .env) line(s)"; k=$(awk '/^JWT_PRIVATE_KEY=/{f=1; sub(/^JWT_PRIVATE_KEY=/,""); print; if (/-----END/) exit; next} f && /^[A-Za-z_]+=/{exit} f{print; if (/-----END/) exit}' .env | sed -e 's/\\n//g' -e 's/-----[A-Z ]*-----//g' | tr -d "\"' \t\r\n"); a=$({ echo "-----BEGIN PRIVATE KEY-----"; echo "$k" | fold -w 64; echo "-----END PRIVATE KEY-----"; } | openssl pkey -pubout 2>/dev/null | grep -v -- ----- | tr -d '\n'); b=$(grep -v -- ----- backend/src/main/resources/jwt-keys/app.pub | tr -d '\r\n'); echo "key body: ${#k} chars"; [ -n "$a" ] && [ "$a" = "$b" ] && echo "KEY MATCHES app.pub" || { [ -n "$a" ] && echo "KEY PARSES BUT IS A DIFFERENT KEY PAIR" || echo "KEY DOES NOT PARSE"; }; unset k a b; docker compose -f docker-compose.prod.yaml config --quiet 2>&1 | sed -E 's/"[^"]{12,}"/"<redacted>"/g'; echo "compose .env exit code: ${PIPESTATUS[0]}"
```

Continue only when you see `KEY MATCHES app.pub` and `compose .env exit code: 0`. What the other results mean:

- **`KEY DOES NOT PARSE`:** the paste went wrong, e.g. a line is missing, or the quotes or header are damaged. A correct key body is about 1600 characters.
- **`KEY PARSES BUT IS A DIFFERENT KEY PAIR`:** you have the wrong key. For example, the key pair was rotated on 2026-09-04.
- **Non-zero exit code:** Compose names the problem, e.g. a leftover key line or a missing variable.

## 5. Create the database, schema and first user

A new database is empty. The backend's default profile never creates tables or users, and no API creates the first user.

### 5a. Start the database and load the schema

```bash
cd /opt/benefit-app && docker compose -f docker-compose.prod.yaml up -d --wait db && { grep -v '^DROP TABLE' backend/src/main/resources/schema-dev.sql; echo ';'; } | docker compose -f docker-compose.prod.yaml exec -T db sh -c 'psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' && echo SCHEMA-OK
```

- **`schema-dev.sql` is the complete current schema**, including every file in `migrations/`, so a new database needs only this file. Don't also run the migrations: `2026_09_19_functional_components_multiplier_constraint.sql` fails with `constraint … already exists`.
- **The file starts with `DROP TABLE ...`.** The `grep -v` removes that line, so running the command again can't wipe data.
- **Write down the commit you loaded the schema from** (`git log --oneline -1`). Later updates need every migration added after it, see [Updating](#updating-to-a-newer-version).

### 5b. Create the first user

Run this line on its own and type the username and password when asked. The password isn't shown as you type:

```bash
read -rp 'App username: ' APP_USER; read -rsp 'App password: ' APP_PW; echo
```

Then create the user. Postgres's `pgcrypto` extension hashes the password with bcrypt, the format the backend expects (`$2a$10$…`). The extension is removed again afterwards:

```bash
printf '%s\n' "CREATE EXTENSION IF NOT EXISTS pgcrypto;" "INSERT INTO app_users (username, password) VALUES (:'u', crypt(:'pw', gen_salt('bf', 10)));" "DROP EXTENSION pgcrypto;" "SELECT id, username FROM app_users;" | docker compose -f docker-compose.prod.yaml exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v u="$1" -v pw="$2"' _ "$APP_USER" "$APP_PW"; unset APP_PW
```

Run the pair again for more users.

## 6. Build and start

```bash
cd /opt/benefit-app && docker compose -f docker-compose.prod.yaml up -d --build && for i in $(seq 60); do curl -sf localhost/api/actuator/health && break; sleep 2; done; echo; docker compose -f docker-compose.prod.yaml ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'; df -h / | tail -1
```

The first build took about 2 minutes on 2 vCPU: Gradle about 70 s, `npm ci` about 20 s, the Vite build about 15 s. Rebuilds reuse the cache. You should see:

- `{"status":"UP"}`
- three containers `Up`
- the backend on `127.0.0.1:8080->8080/tcp` and the database on `127.0.0.1:5433`
- the frontend on `0.0.0.0:80`

## 7. Check from outside and log in

From your own machine, not the server:

```bash
curl -s http://<server-ip>/api/actuator/health
```

Then open `http://<server-ip>` in the browser and log in with the user from step 5b. Create a project, reload the page, and check it's still there.

Two harmless things you may see:

- **The URL looks like `/#/login`**, because the frontend uses hash routing.
- **The browser console shows `GET /version.json 404`.** Only GitHub Pages deployments generate that file, and all it does is show the commit SHA, which appears as `-` here.

## Updating to a newer version

```bash
cd /opt/benefit-app && git pull --ff-only && docker compose -f docker-compose.prod.yaml up -d --build
```

The database volume is kept. **Schema changes aren't applied automatically.** Before starting the new version, apply by hand every file in `backend/src/main/resources/migrations/` added since the commit you loaded the schema from. Apply them oldest first, and take a backup first:

```bash
cd /opt/benefit-app && docker compose -f docker-compose.prod.yaml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > /root/backup-$(date +%F).sql
```

```bash
cd /opt/benefit-app && docker compose -f docker-compose.prod.yaml exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < backend/src/main/resources/migrations/<file>.sql
```

## Everyday commands

All from `/opt/benefit-app`:

| What | Command |
|---|---|
| Status | `docker compose -f docker-compose.prod.yaml ps` |
| Backend logs | `docker compose -f docker-compose.prod.yaml logs --tail 100 -f backend` |
| Restart one service | `docker compose -f docker-compose.prod.yaml restart backend` |
| SQL shell | `docker compose -f docker-compose.prod.yaml exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'` |
| Stop everything (keeps data) | `docker compose -f docker-compose.prod.yaml down` |
| Disk usage | `df -h / && docker system df` |

Never add `-v` to `down` on the server: it deletes the database volume.

## What went wrong on the way

The first attempts (issues #718–#722, #738, #742) and the successful run on 2026-09-25 hit these problems. Each entry says how to recognise it.

- **The dev Compose file was used on the server.** `docker compose up` without `-f` uses `docker-compose.yaml`, which runs Gradle and the Vite dev server inside the containers. Symptoms:
  - `npm: not found` from nginx's `/docker-entrypoint.sh`
  - Gradle's `Cannot find a Java installation … languageVersion=21`

  It also published the database on `0.0.0.0:5433`, and the `dev` profile seeded it with test accounts. Fix: always use `-f docker-compose.prod.yaml` (#739).
- **The disk was full.** Earlier builds had left 2.6 GB of images, 2.3 GB of build cache and host Gradle/npm caches on a 10 GB disk, leaving 647 MB free. Builds would have failed with `no space left on device`. Step 2 freed 4 GB. Upgrading an UpCloud plan doesn't grow the disk by itself.
- **The JWT key seemed not to match.** A first version of the key check read only the first line of `JWT_PRIVATE_KEY`, but the key from `backend-credentials` is multi-line, so a correct key looked empty. Joining the lines by hand in an editor made it harder to tell what was wrong. Step 4c's check reads both formats and says *why* a key fails. Two other traps:
  - Pasting into micro needs the terminal's paste shortcut, not Ctrl+V.
  - A wrong but valid key doesn't stop the backend. Login succeeds and then every request returns `401` (#643).
- **Port 8080 was blocked by the UpCloud firewall.** The frontend loaded, but API calls to `:8080` timed out. `ufw` was already inactive, so nothing on the server was blocking it. How we proved the packets never arrived:
  - Port 443 answered "connection refused" at once: packets reach the server, and nothing listens there.
  - Port 8080 timed out: packets are dropped on the way.
  - The server's nft DNAT rule for 8080 had a counter of `packets 0`.
  - `tcpdump -ni any 'tcp dst port 8080'` saw nothing while the page was requested from outside.

  Without control panel access this couldn't be fixed from the server. So nginx now forwards `/api/` to the backend and only port 80 is needed (#744, #745).
- **The database starts empty.** The default profile doesn't create the schema, and there's no API for the first user. Step 5 covers both.

## See also

- [Deployment guide: self-hosted server with Docker](./deployment_guide.md#self-hosted-server-with-docker): the stack's services, variables and the "backend outside Docker" fallback
- [Database guide](./database.md): profiles, seeding and manual migrations
