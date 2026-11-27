> **Historical document — archived 2026-11-27.** This procedure is no longer maintained; use the [current deployment guide](../guides/deployment_guide.md) for active environments.

## Self-hosted server with Docker

For a server of your own (e.g. UpCloud) instead of Scalingo and GitHub Pages, run the whole stack from `docker-compose.prod.yaml`. For a step-by-step walkthrough from an empty server to a working login, see the [UpCloud deployment guide](./upcloud_deployment_2026-11-27.md).

```bash
docker compose -f docker-compose.prod.yaml up -d --build
```

Always pass `-f docker-compose.prod.yaml`. Plain `docker compose up` uses `docker-compose.yaml`, the **local dev** stack: it runs Gradle and the Vite dev server inside the containers, bind-mounts the source and reseeds the database on every start. Pointing that file at the production Dockerfiles fails with `npm: not found` (from nginx's `/docker-entrypoint.sh`) and Gradle's `Cannot find a Java installation … languageVersion=21`.

> **Warning:** this stack serves everything over plain HTTP. Login sends the username and password (HTTP Basic) and every API call carries a JWT, so both cross the network unencrypted. It's fine for a test server, but before real users log in, put a TLS reverse proxy (e.g. Caddy) in front of port 80 and set `CORS_ALLOWED_ORIGINS` to its `https://` address.

The production stack:

- **db** – Postgres, published on `127.0.0.1:${HOST_DB_PORT}` only. Docker-published ports bypass `ufw`, so this is the only thing keeping the database off the internet.
- **backend** – the jar from `backend/Dockerfile`, default profile, published on `127.0.0.1:${HOST_BACKEND_PORT:-8080}` only (for health checks on the server). It never creates the schema or seeds data.
- **frontend** – the built bundle served by nginx on port `${HOST_HTTP_PORT:-80}`, from the root path `/`. nginx also forwards `/api/` to the backend (`/api/token` → `/token`), so the browser only ever talks to port 80. The bundle calls the relative URL `/api`, so it doesn't need to know the server's address.

Set these in the root `.env` (see `.env.example`). Compose refuses to start and names the variable if one is missing:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `JWT_PRIVATE_KEY`, this server's own private key. Don't reuse another environment's key. To make a new one: `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`
- `CORS_ALLOWED_ORIGINS`, the exact origin the frontend is opened from, e.g. `http://<server-ip>` (scheme, host and port only, no path). The API calls go through nginx, but the backend still checks the browser's `Origin`, so without it login fails with `403`.

Only port 80 (and 22 for SSH) has to be open in the UpCloud firewall. The backend's 8080 and the Vite dev server's 5173 aren't used from outside.

Things to know:

- To update a running server, use `./update_server.sh`. It pulls, builds, backs up the database, applies new migrations and restarts. See [Updating](./upcloud_deployment_2026-11-27.md#updating-to-a-newer-version) in the UpCloud guide.
- A new database volume starts **empty**. The backend doesn't create tables or the first user. Load `schema-dev.sql` without its `DROP TABLE` line (it already includes every migration) and insert the first user by hand, as in [step 5 of the UpCloud guide](./upcloud_deployment_2026-11-27.md#5-create-the-database-schema-and-first-user).
- On a 1 GB server the Gradle build can run out of memory. Add swap before building if it gets killed.
- Building on the host instead of in Docker needs the **JDK** (`openjdk-21-jdk-headless`). The JRE alone gives the same `Cannot find a Java installation` error.

### Fallback: backend outside Docker

If the backend container won't run, run the jar on the host and keep the database and frontend in Docker. From the repository root on the server:

1. Start only the database. Use the production file to retain the server configuration. Do not use the development stack for server recovery: its dev backend deletes and reseeds data on startup. Compose checks the whole file, so `.env` still needs every value listed above.

   ```bash
   docker compose -f docker-compose.prod.yaml up -d db
   ```

2. Build the jar (needs the JDK, see above):

   ```bash
   cd backend && ./gradlew bootJar
   ```

3. Load `.env` into the shell. Java doesn't read it by itself.

   ```bash
   set -a && source ../.env && set +a
   ```

4. Start the backend. The inline values override `.env`, whose `SPRING_DATASOURCE_URL` points at the Compose hostname `db`, which only exists inside Docker.

   ```bash
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:${HOST_DB_PORT:-5433}/$POSTGRES_DB SPRING_DATASOURCE_USERNAME=$POSTGRES_USER SPRING_DATASOURCE_PASSWORD=$POSTGRES_PASSWORD API_DEBUG=never nohup java -jar build/libs/backend-*.jar > backend.log 2>&1 &
   ```

5. Start the frontend without the backend container (`--no-deps`), which would otherwise compete for port 8080. nginx forwards `/api/` to the backend container by default, so point `BACKEND_UPSTREAM` at the jar on the host instead. Containers reach the host at the gateway address of Docker's `bridge` network (usually `172.17.0.1`):

   ```bash
   cd .. && BACKEND_UPSTREAM=$(docker network inspect bridge -f '{{(index .IPAM.Config 0).Gateway}}'):8080 docker compose -f docker-compose.prod.yaml up -d --build --no-deps frontend
   ```

Prefer the jar over `./gradlew bootRun` here: `bootRun` keeps Gradle in memory next to the app and loads the development tools. If you do use it, never set `SPRING_PROFILES_ACTIVE=dev` on a server. That profile deletes every row and reseeds test accounts, and the dev-profile safety check can't tell a database on the same server from one on a laptop.

