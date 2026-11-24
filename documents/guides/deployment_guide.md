# Deployment Guide

For an outage or urgent recovery, start with [incident response](incident_response.md): identify the environment, inspect health/logs, and choose a recovery action.

Testing deploys automatically from `main` to Scalingo and GitHub Pages.

## Testing GitHub Pages site

- Frontend: https://fisma-benefit-app-testing.github.io/scalingo/
- Repository: [fisma-benefit-app-testing/fisma-benefit-app-testing.github.io](https://github.com/fisma-benefit-app-testing/fisma-benefit-app-testing.github.io). GitHub Pages serves the `gh-pages` branch from its root.
- The workflow publishes the `scalingo` directory using the repository write deploy key. Its private half is the `TESTING_PAGES_DEPLOY_KEY` Actions secret in the main repository.

To rotate the key, generate an Ed25519 key pair, add the new public key under **Settings → Deploy keys** on the testing Pages repository with write access, and update `TESTING_PAGES_DEPLOY_KEY` in the main repository. Remove the old deploy key after verifying the new one. Keep the testing organization’s owners current when maintainers change.

## Scalingo testing environment

[Deploy Scalingo testing](../../.github/workflows/deploy-scalingo-testing.yml) publishes the testing frontend on pushes to `main`. Scalingo’s GitHub integration automatically deploys the backend from `main` once its GitHub checks finish.

### Scalingo setup

- App: [`benefit-testing` in `osc-fr1`](https://dashboard.scalingo.com/apps/osc-fr1/benefit-testing). API: `https://benefit-testing.osc-fr1.scalingo.io`.
- Set `PROJECT_DIR=backend` and configure the testing PostgreSQL add-on, `SPRING_DATASOURCE_*` variables, and testing `JWT_PRIVATE_KEY` as described in the [Scalingo setup guide](scalingo_deployment.md).
- Set `CORS_ALLOWED_ORIGINS` to include `https://fisma-benefit-app-testing.github.io`, then restart or redeploy the app. The value is an origin without a path.
- In **Deploy → Configuration**, link `fisma-benefit-app/benefit-app` and enable **Automatic deploy** for `main`.
- Initialize the testing database and provision a dedicated Playwright user that can create and delete its own projects. [Scalingo maintenance](scalingo_maintenance.md) covers logs, backups, and manual migrations.

### GitHub Actions secrets

| Secret | Value |
| --- | --- |
| `TESTING_PAGES_DEPLOY_KEY` | The private half of the write deploy key on the testing Pages repository. |
| `SCALINGO_E2E_TEST_USERNAME` | Dedicated Playwright test username in the testing database. |
| `SCALINGO_E2E_TEST_PASSWORD` | Password for that user. |

### Run Playwright after deployment

Confirm in the Scalingo deployment history that the latest successful deployment is the current `main` commit. Then run **Deploy Scalingo testing** on `main` from GitHub Actions. The manual run republishes the frontend, checks backend health and CORS, waits for Pages to serve that commit, and runs Playwright. Playwright is manual at this stage because Scalingo waits for push checks to finish before starting the backend deployment.

## Database backups

Confirm the target app and take a backup before applying migrations. Use the [Scalingo backup procedure](scalingo_maintenance.md#backups) with the app listed in the [database guide](database.md#access-via-scalingo-cli). Coordinate restores with the service owner.

## Production deployments

1. Open the [production Scalingo app](https://dashboard.scalingo.com/apps/osc-fr1/benefit) and manually deploy the intended revision from `main`. Apply any required migrations in the order described in the [database guide](database.md).
2. Confirm the deployment succeeded and the [production health endpoint](https://benefit.osc-fr1.scalingo.io/actuator/health) reports `UP`.
3. If publishing the production frontend, run [Run deployments](../../.github/workflows/run-deployments.yml) manually on `main` after verifying it points to the intended release. The workflow reads the backend URL from the GitHub Actions variable `PRODUCTION_URL`.
4. Verify login in the [production app](https://fisma-benefit-app.github.io/benefit-app/).

For testing, see [Scalingo testing environment](#scalingo-testing-environment). To redeploy testing manually, deploy `main` from the testing Scalingo dashboard, then run **Deploy Scalingo testing** on `main` from Actions.

## Manual deployment to frontend from CLI

To publish the frontend to GitHub Pages from the CLI, follow these steps.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set .env variables

Create or edit `frontend/.env.production` and `frontend/.env.testing` with the correct backend URL and GitHub Pages base path:

```bash
# .env.production
VITE_API_URL=https://benefit.osc-fr1.scalingo.io
VITE_BASE_PATH=/benefit-app/
```

```bash
# .env.testing
VITE_API_URL=https://benefit-testing.osc-fr1.scalingo.io
VITE_BASE_PATH=/scalingo/
```

`VITE_BASE_PATH` must be set here so that Vite knows to dynamically set the base path according to the run deployment script. Without `VITE_BASE_PATH`, deployment fails. You also need the correct backend URLs for `VITE_API_URL`. The hosted URLs are shown above.

### 3. Build & Deploy

Make sure you have pulled the latest changes in the `main` branch. Deployment to production and testing environments is done from the `main` branch.

```bash
# To deploy to testing environment
git switch main
git pull origin main
cd frontend
npm run deploy:testing
```

```bash
# To deploy to production environment
git switch main
git pull
cd frontend
npm run deploy:production
```

`deploy:testing` pushes to the [testing GitHub Pages site](#testing-github-pages-site) over SSH, so your own SSH key needs write access to `fisma-benefit-app-testing/fisma-benefit-app-testing.github.io`.

These run:

- predeploy → builds into `dist/`
- production:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch)
- testing:
  - deploy → publishes `dist/` to the testing GitHub Pages site (`fisma-benefit-app-testing/fisma-benefit-app-testing.github.io`, `gh-pages` branch, `scalingo` directory)

### 4. Verify deployment

- Check the GitHub repo's Settings → Pages to confirm deployment (`benefit-app` for production, `fisma-benefit-app-testing.github.io` for testing)
- Access production frontend at: https://fisma-benefit-app.github.io/benefit-app/
- Access testing frontend at: https://fisma-benefit-app-testing.github.io/scalingo/

## Self-hosted server with Docker

For a server of your own (e.g. UpCloud) instead of Scalingo and GitHub Pages, run the whole stack from `docker-compose.prod.yaml`. For a step-by-step walkthrough from an empty server to a working login, see the [UpCloud deployment guide](./upcloud_deployment.md).

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

- To update a running server, use `./update_server.sh`. It pulls, builds, backs up the database, applies new migrations and restarts. See [Updating](./upcloud_deployment.md#updating-to-a-newer-version) in the UpCloud guide.
- A new database volume starts **empty**. The backend doesn't create tables or the first user. Load `schema-dev.sql` without its `DROP TABLE` line (it already includes every migration) and insert the first user by hand, as in [step 5 of the UpCloud guide](./upcloud_deployment.md#5-create-the-database-schema-and-first-user).
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

## Important notes

- Always backup the database before backend deployment
- Ensure `.env.testing` and `.env.production` have the correct backend URLs and base paths before building frontend to testing or production
- Run correct frontend deployment scripts to deploy to correct environments (`npm run deploy:testing` for testing, `npm run deploy:production` for production)
