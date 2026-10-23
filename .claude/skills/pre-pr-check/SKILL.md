---
name: pre-pr-check
description: Run the same checks CI runs (Prettier, ESLint, tsc -b, Vitest, Spotless, backend tests) before opening or updating a PR. Use when the user asks to check, verify or prepare a branch for a PR, or before you open one.
---

# Pre-PR check

`run-checks-on-pr.yml` must pass on every PR. This runs the same commands locally so failures show up before the push. If the workflow file changes, update this skill to match.

## 1. Decide what to run

```bash
git fetch origin main && git diff --name-only origin/main...HEAD
```

- Any path under `frontend/` → run the frontend checks.
- Any path under `backend/` → run the backend checks.
- Neither (docs, workflows only) → say so and skip both.

## 2. Frontend checks (from `frontend/`)

Needs `frontend/node_modules`; if it is missing, see the `worktree-local-stack` skill. Run all four even if one fails, so the user gets the full list of problems in one go.

```bash
cd frontend
npx prettier --check .
npx eslint . --max-warnings 0
npx tsc -b
npm test
```

To fix formatting, run `npx prettier . --write`, then re-run the check.

## 3. Backend checks (from `backend/`)

The tests need Postgres on host port 5433 (`HOST_DB_PORT`): `docker compose up -d db` from the repo root.

```bash
cd backend
./gradlew spotlessCheck test --continue
```

`./gradlew spotlessApply` fixes formatting. If the host has no JDK (`which java` is empty), run Gradle in the dev image instead:

```bash
docker run --rm --network host -v "$PWD/backend:/workspace" -v fisma-dev_gradle-cache:/gradle-cache \
  -w /workspace -e GRADLE_USER_HOME=/gradle-cache fisma-dev-backend ./gradlew spotlessCheck test --continue
```

(Run from the repo root. The image `fisma-dev-backend` and the volume exist after the dev stack has been built once.)

## 4. Report

State which checks ran, which passed, and which failed with the relevant output. Do not claim a check passed if you skipped it or could not run it (say why). Do not fix unrelated failures; mention them.

## Gotchas

- `tsc -b`, not `tsc --noEmit`: the root tsconfig only references `tsconfig.app.json` and `tsconfig.node.json`, so plain `tsc` checks nothing.
- ESLint fails CI on any warning (`--max-warnings 0`). Fix the warning; do not disable the rule to get a pass.
- Missing types such as `pdfmake` mean `node_modules` is stale, not that the code is wrong: `npm ci`.
- Backend tests fail with connection errors if Postgres is not up on host port 5433. That is a setup problem, not a test failure.
- Spotless runs inside `./gradlew` and needs it executable (`chmod +x backend/gradlew`).

Branch naming, PR scope and when a regression test is required are in AGENTS.md ("CI/CD" and "What earns a frontend test").
