# Develop Benefit locally

Use this guide to run the app, make a first change, and diagnose local setup problems. Commands use a POSIX shell such as Bash; on Windows, WSL2 provides that environment. The default Docker setup does not require Java or Node.js on the host. Host-side development and checks do.

For hosted environments, follow [deployment guidance](deployment_guide.md). For branch and PR expectations, read [Contributing](contributing.md).

## Choose your setup

| Setup | Use it when | Host prerequisites |
| --- | --- | --- |
| Full Docker stack | You want the shortest path to a working app. | Git, Docker, and Docker Compose. |
| Local Java/Node processes with Docker PostgreSQL | You want to run/debug the app directly in your IDE. | Git, Docker, Java 21, Node.js 24, and npm. |

Java 21 comes from the backend toolchain. Node.js 24 matches the current CI and frontend development image; check the tracked files when updating those versions.

## Prepare the checkout

From a directory where you keep source code:

```bash
git clone https://github.com/fisma-benefit-app/benefit-app.git
cd benefit-app
cp .env.example .env
cp frontend/.env.example frontend/.env
```

The examples contain local defaults. Preserve your existing environment files rather than overwriting them on an established checkout. Real `.env` files are ignored by Git; never include their contents in a commit or bug report.

Enable the formatting hook once:

```bash
git config core.hooksPath .githooks
```

## Run the full Docker stack

Start Docker, then run from the repository root:

```bash
docker compose up --build -V
```

Compose starts PostgreSQL, the Spring Boot backend, and the Vite frontend. Source directories are mounted into the development containers for reloads. `-V` refreshes the anonymous frontend dependency volume; rebuilding matters when dependencies or Dockerfiles change.

| Check | Default |
| --- | --- |
| Frontend | [Open login](http://localhost:5173/benefit-app/login) |
| Backend | [Health endpoint](http://localhost:8080/actuator/health), expected JSON status `UP` |
| Local user | `user` / `user` |
| Local administrator | `admin` / `admin` |
| PostgreSQL host port | `5433` |

The development backend uses `SPRING_PROFILES_ACTIVE=dev`. **It deletes and reseeds the local database on backend startup**, including a restart that reloads the application. Use disposable local data. The shared `application.yaml` intentionally keeps SQL initialization disabled; do not change it to enable local seeding.

Stop without removing named volumes:

```bash
docker compose down
```

Keeping a database volume does not prevent the dev profile from reseeding it at the next backend start.

## Run Java and Node directly

Use the same environment-file preparation. Stop any Docker backend/frontend first so their ports are free. From the repository root, start only PostgreSQL:

```bash
docker compose up -d db
```

In a terminal, run the backend using the example local database defaults:

```bash
cd backend
SPRING_PROFILES_ACTIVE=dev \
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/fisma_db \
SPRING_DATASOURCE_USERNAME=myuser \
SPRING_DATASOURCE_PASSWORD=secret \
./gradlew bootRun
```

Adapt those connection values if you changed the example Compose database settings. The `db` hostname in the root example configuration is for communication inside Compose; a host Java process connects through `localhost` and the published port. Gradle does not automatically load the root `.env` file.

In a second terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the same frontend and health URLs. The built-in signing key works only under `dev`. Other profiles require an appropriate `JWT_PRIVATE_KEY`; see [authentication](authentication.md). A default-profile start does not initialize or seed the database.

## Know which setting to change

| Setting | Location / meaning |
| --- | --- |
| PostgreSQL credentials and `HOST_*` ports | Root `.env`, interpreted by Compose. Use the example file for available settings. |
| `SPRING_DATASOURCE_*` | Backend database connection. Container and host URLs differ. |
| `VITE_API_URL` | `frontend/.env`; URL the browser uses to reach the backend. Rebuild deployed assets when it changes. |
| `VITE_BASE_PATH` | Frontend URL prefix, normally `/benefit-app/` locally; required for testing/production builds. |
| `CORS_ALLOWED_ORIGINS` | Backend setting for browser origins; scheme, host, and port, without a path. Update it if the frontend origin changes. |
| `JWT_PRIVATE_KEY` | Optional only under the dev profile; deployed environments need separate keys. |
| `API_DEBUG` / `API_DEBUG_LEVEL` | Backend error-detail and security-log settings. Keep hosted settings appropriate to their environment. |

See [database initialization](database.md) and [authentication](authentication.md) for the mechanisms. Do not troubleshoot by switching on dev seeding against a database you need to preserve.

## Make a first change

1. Create an issue-linked branch using [Contributing](contributing.md).
2. Locate the feature through the [architecture code map](../references/architecture.md#find-the-code-for-a-change).
3. Make a small, reversible UI/text change first if you are learning the project. Shared labels live in `frontend/src/lib/translations.ts`; pages and feature components live under `frontend/src/components/`.
4. Confirm the change in the browser and check both languages when changing translations.
5. Run the relevant checks below and review the diff. Include any change to the behavior's documentation.

Point math, permissions, session behavior, and schema changes need their corresponding domain/reference guidance before editing.

## Run checks

Run host-side checks with Java 21 / Node.js 24 available. The frontend container's dependency volume does not install host `node_modules`; run `npm ci` under `frontend/` before host checks on a fresh checkout.

From `frontend/`:

```bash
npm ci
npx prettier --check .
npx eslint . --max-warnings 0
npx tsc -b
npm test
```

The root TypeScript configuration references the actual projects, so use `tsc -b`. Unit tests use a separate Vitest configuration; Vite builds require the environment settings even though those tests do not. `npm run knip` is an optional dead-code check and needs the frontend environment file.

Backend integration tests need disposable PostgreSQL data. Stop the application backend before running them: tests initialize/reset tables and must not share a database with an app whose state you need to keep. For a host `bootRun` process, stop it with Ctrl+C. With the example Compose settings, from the repository root:

```bash
docker compose stop backend
docker compose up -d db
cd backend
./gradlew spotlessCheck test --continue
```

The test profile defaults to `localhost:5433/fisma_db` with the example credentials. For a different disposable database, supply `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` to the Gradle command. Do not point tests at shared testing/production data.

To format changed code, use `./gradlew spotlessApply` under `backend/`, or the installed Prettier under `frontend/`. Review the result rather than reformatting unrelated files. The [pre-PR procedure](../../.claude/skills/pre-pr-check/SKILL.md) lists the checks to run for a change.

## Troubleshoot by symptom

| Symptom | Check / remedy | Confirmation |
| --- | --- | --- |
| Compose refuses to start because a value is missing | Verify both example files were copied and the root required values are set. | Compose reaches service startup without printing configuration errors. |
| Login URL contains `undefined/token` | Correct `VITE_API_URL` in the frontend environment and restart Vite. | Browser Network shows requests to the intended backend. |
| Backend cannot connect to `db` when run on the host | Use the localhost JDBC URL above. | Backend health returns `UP`. |
| Port 5173, 8080, or 5433 is occupied | Stop the competing stack/process or adjust host ports and the related API/origin settings. | Only the intended process owns the port; browser requests use the adjusted URL. |
| Dev-profile startup is refused for a non-local database | Verify the intended target and profile. Use disposable local data for dev. | Start uses the intended profile and database; do not bypass the guard. |
| Login fails only when launched from an IDE | Compare the IDE launch profile, JDK, working directory, and environment with the documented terminal setup. | The same configuration succeeds from both launch paths. |
| Authentication fails | Read backend logs and the browser request/status before changing settings. Check API URL, origin, and database connectivity. | Health works and the sign-in request succeeds. |
| Dependencies appear stale in Docker | Rebuild with `docker compose up --build -V`. | Container build and dependency loading complete successfully. |
| File changes are not detected on Windows | Prefer the WSL filesystem and inspect the polling settings rather than keeping the checkout on `/mnt/c/`. | A small source edit reloads the expected process. |
| Java or dependency errors on the host | Confirm Java 21, Node 24, and host dependencies. Check for container-created file ownership conflicts before deleting build output. | The relevant check runs from the documented directory. |

### Logs

From the repository root:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

For direct Java/Node processes, read their terminal output. UI runtime errors appear in browser DevTools; inspect the Network tab for failing API requests. Hosted log shortcuts remain in the [README](../../README.md#quick-reference) and provider runbooks.

### Caches and build artifacts

Try a browser hard reload for stale assets. Clear Vite's dependency cache in the Docker frontend, then restart it:

```bash
docker compose exec frontend rm -rf node_modules/.vite
docker compose restart frontend
```

For a host Vite process, stop it and restart from `frontend/` with `npm run dev -- --force`.

Gradle build artifacts and dependency caches are different from Spring application caches. Benefit does not use a Spring application cache by default. Use targeted remedies for a demonstrated build/dependency failure; clearing caches does not fix incorrect calculation inputs or formulas.

### Reset this local project

If a disposable local stack genuinely needs a clean database and volumes, stop it and reset only this Compose project:

```bash
docker compose down -v
docker compose up --build -V
```

This removes the project's named volumes, including its local database and Gradle cache. A new dev backend will seed again. Do not use a whole-machine Docker prune as a routine project reset.

## Before asking for help

Record your source revision, setup choice, command and working directory, failing status/error, and the result of the health check. Include relevant sanitized logs. Exclude tokens, passwords, real environment-file contents, and database dumps. Link a reproducible problem to [an issue](https://github.com/fisma-benefit-app/benefit-app/issues).
