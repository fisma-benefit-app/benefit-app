---
name: worktree-local-stack
description: Get a fresh git worktree of this repo ready to run the app or its checks - env files, frontend node_modules, docker compose stack. Use when starting work in a new worktree, when compose or Vite fails on missing env vars, or when eslint/tsc/vitest fail because node_modules is missing.
---

# Local stack in a fresh worktree

A new worktree (for example under `.claude/worktrees/`) contains only tracked files. Everything gitignored is missing. The main checkout is the source for it.

## 1. Env files

`.worktreeinclude` makes Claude Code copy `.env` and `frontend/.env` into new worktrees. Check they exist:

```bash
ls -l .env frontend/.env
```

If one is missing (worktree made another way), copy it from the main checkout, which is `git worktree list | head -1`:

```bash
MAIN=$(git worktree list --porcelain | awk 'NR==1{print $2}')
cp "$MAIN/.env" .env && cp "$MAIN/frontend/.env" frontend/.env
```

- Without the root `.env`, compose refuses to start.
- Without `frontend/.env`, the frontend container exits with "VITE_API_URL is not set", even though compose accepted the root `.env`.
- If the main checkout has no `.env` either, copy `.env.example` and `frontend/.env.example`. The defaults work locally.
- These files hold real local secrets. Never print, paste or commit their contents.

## 2. Frontend dependencies

Needed for `eslint`, `prettier`, `tsc` and `vitest` on the host (not for the Docker stack):

```bash
cd frontend && npm ci
```

A symlink to the main checkout's `node_modules` is a faster alternative. It is gitignored, but remove the link (`rm frontend/node_modules`, not `rm -r`) before deleting the worktree so nothing follows it into the main checkout:

```bash
ln -s "$MAIN/frontend/node_modules" frontend/node_modules
```

If `tsc` complains about missing types (for example `pdfmake`), the install is stale: `npm ci` in the main checkout's `frontend/`, or here.

## 3. Start the stack

Run from the worktree root:

```bash
docker compose up --build -V -d
```

(`-V` refreshes the anonymous `node_modules` volume so new npm deps show up.)

- Frontend: http://localhost:5173/benefit-app/login. Backend health: http://localhost:8080/actuator/health. Dev login: `user` / `user`.
- Compose uses fixed container names (`fisma_db`, `fisma_backend`, `fisma_frontend`), fixed ports and the shared `fisma-dev_pgdata` volume, so **only one stack can run at a time**, including the main checkout's. Check with `docker compose ps` and `docker ps` before starting; if another checkout's stack is up, ask the user before stopping it.
- The backend's `dev` profile deletes and reseeds the database on every start. Tell the user this before starting.
- Only the database is needed for backend tests and Gradle runs: `docker compose up -d db`.

## 4. Backend without a host JDK

If `which java` is empty, run Gradle in the dev image with host networking (the Postgres container must be up on host port 5433):

```bash
docker run --rm --network host -v "$PWD/backend:/workspace" -v fisma-dev_gradle-cache:/gradle-cache \
  -w /workspace -e GRADLE_USER_HOME=/gradle-cache fisma-dev-backend ./gradlew <tasks>
```

## 5. Cleanup

When the work is merged: `docker compose down` (add `-v` only to wipe the DB), then remove the worktree and its branch.
