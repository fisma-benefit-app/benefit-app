# AGENTS.md

Guidance for AI coding agents (Claude Code, GitHub Copilot, Gemini, etc.) working in this repository.

## Project overview

Benefit is a function point analysis tool (FiSMA 1.1 method / ISO/IEC 29881) built for FiSMA ry and Haaga-Helia UAS. It's a monorepo with a Spring Boot backend and a React/TypeScript frontend.

## Commands

### Running the app locally

```bash
# Full Dockerized setup (build on first run or when Dockerfiles change)
docker compose up --build

# Stop (keep DB data/caches) / stop and wipe everything
docker compose down
docker compose down -v
```

Frontend: http://localhost:5173/benefit-app/login · Backend: http://localhost:8080/actuator/health · Dev login: `user` / `user`

Without Docker: run only the DB via `docker compose up db`, then `cd backend && ./gradlew bootRun` and `cd frontend && npm install && npm run dev`. The backend requires `JWT_PRIVATE_KEY` set in the root `.env` (from the private `backend-credentials` repo) — it is not in this repository.

### Backend (`backend/`)

```bash
./gradlew bootRun                                    # run
./gradlew build                                       # build
./gradlew test                                        # run all tests (needs Postgres — `docker compose up db` first)
./gradlew test --tests fi.fisma.backend.YourTestClass # run a single test class
./gradlew spotlessCheck                                # check formatting (Google Java Format)
./gradlew spotlessApply                                # auto-fix formatting
```

### Frontend (`frontend/`)

```bash
npm run dev                # dev server
npx eslint .                # lint
npx prettier . --write      # format
npm run build:testing        # build for testing env (needs frontend/.env)
npm run build:production     # build for production env
```

There is no frontend test suite (no test runner installed, no `*.test.ts(x)`/`*.spec.ts(x)` files) — don't invent an `npm test` command. Frontend correctness currently relies on ESLint, Prettier, `run-checks-on-pr.yml`, and manual verification.

### Formatting hook

A pre-commit hook (`.githooks/pre-commit`) runs Prettier on staged frontend files and Spotless on staged backend files, then re-stages them. Enable it once per clone with:

```bash
git config core.hooksPath .githooks
```

## Architecture

### Backend — layered Spring Boot (`backend/src/main/java/fi/fisma/backend/`)

Per the backend ADR (`documents/references/adr_backend.md`), the backend is intentionally organized by layer, not by feature:

- `api/` — REST controllers (`ProjectController`, `FunctionalComponentController`, `CommentController`, `AppUserController`)
- `domain/` — JPA entities (`Project`, `FunctionalComponent`, `AppUser`, `Comment`, `ProjectAppUser`)
- `dto/` — request/response DTOs
- `mapper/` — domain ↔ DTO conversion
- `service/` — business logic orchestrating repositories/mappers
- `repository/` — Spring Data JPA interfaces
- `security/` — JWT auth (`TokenController`, `TokenService`, `JwtRevocationFilter`, `TokenBlacklistService`, `UserDetailsServiceImpl`, `SecurityConfig`)
- `exception/` — `GlobalExceptionHandler` and custom exceptions

Keep business logic in `service/`, not in controllers or repositories — that discipline is the explicit tradeoff called out in the ADR for this layered structure.

**Auth flow**: login uses HTTP Basic against `POST /token`; the backend returns a JWT in the `Authorization: Bearer <jwt>` response header (exposed via CORS). The JWT is RSA-signed (`JWT_PRIVATE_KEY`/`jwt-keys/app.pub`), carries the username as `sub` and `ROLE_USER` as `scope`, and is valid 24h. Logout blacklists the token's `jti` in-memory via `TokenBlacklistService` until expiry. Full detail in `documents/guides/authentication.md`.

**Database**: Postgres. Schema/seed data live in `backend/src/main/resources/` (`schema.sql`, `data.sql`, `database-seed-{dev,testing,production}.sql`); seeding is controlled by the `DATABASE_INIT_MODE`/`DATABASE_SEED_FILE` env vars (see `application.yaml`). **Migrations are manual, not run automatically** — new SQL files are added under `backend/src/main/resources/migrations/` and must be applied by hand against each environment (see `documents/guides/database.md`).

### Frontend — React + TypeScript + Vite (`frontend/src/`)

- `components/` — page/feature components (`ProjectPage`, `ProjectList`, `FunctionalClassComponent`, `FunctionalPointSummary`, modals, etc.)
- `context/` + `hooks/` — global state via React Context: `AppUserContext`/`useAppUser` (auth/session, persisted to `sessionStorage`) and `ProjectsContext`/`useProjects` (all projects, CRUD). See `documents/references/state_management.md` for the full data-flow diagram and patterns (debounced auto-save via a ref to avoid stale closures, `isLatest` gating on edits, orderPosition normalization on fetch).
- `api/` — fetch wrappers per resource (`project.ts`, `comments.ts`, `authorization.ts`, `profile.ts`)
- `lib/` — `centralizedCalculations.ts` (memoized FP calculations — the single source of truth for point math, see `documents/references/centralized_calculations.md`; clear its cache via `clearCalculationCache()` in devtools if calculations look stale), `calculations.ts`, `types.ts`, `printUtils.ts` (CSV/PDF export), `jwtUtils.ts`, `translations.ts`, `fc-constants.ts`/`fc-service-functions.ts` (functional component class/type config)

**Project versioning**: projects sharing a `projectName` are versions of each other; only the latest version is editable (`checkIfLatestVersion`), and archiving a project creates a new version rather than overwriting the old one.

**Env vars**: `VITE_API_URL` is required (Vite build fails without it — see `vite.config.ts`); `VITE_BASE_PATH` is required for `testing`/`production` mode builds.

### FiSMA 1.1 domain model

A `Project` contains `FunctionalComponent`s. Each component has a `className`/`componentType`, a `degreeOfCompletion` (0.0–1.0), an `orderPosition` (drag-and-drop order), and class-specific FP inputs (`dataElements`, `readingReferences`, `writingReferences`, `functionalMultiplier`, `operations`). Functional size is measured strictly from functional requirements — technical features (logging, caching) are explicitly out of scope for point calculations.

## CI/CD

- Trunk-based development: all work merges to `main` via PR (see `documents/guides/branching_strategy.md`). Development branches are named `issue/#XXX-description` (features), `bugfix/#XXX-description`, or `chore/description`; keep each PR scoped to one issue — unrelated changes get their own issue and PR.
- `run-checks-on-pr.yml` (GitHub Actions) runs on every PR and must pass: backend Spotless check, frontend Prettier check, frontend ESLint, backend tests (against a Postgres service container). PRs also require peer review/approval.
- Before opening a PR: link it to its issue and make sure CI (Spotless, Prettier, ESLint, backend tests) passes locally first.
- Merges to `main` auto-deploy to the testing environment (Heroku backend + GitHub Pages frontend). Production deploys are triggered manually from Heroku, then GitHub Actions rolls the frontend to GitHub Pages (`run-deployments.yml`).
- Version bumps use `./update_version.sh X.Y.Z`, which opens a `chore/update-version-to-X.Y.Z` PR; merging it auto-creates the `vX.Y.Z` git tag (`create-release-tag.yml`). See `documents/guides/versioning.md`. Only run this when explicitly asked to cut a release — merging its PR is not easily reversible.

## Notes

- API docs are generated via SpringDoc + Widdershins; refresh with the steps in `documents/guides/generate_api_docs.md` (`npx widdershins`, not installed as a dependency because it causes `npm audit` issues).
- Known local-dev issues and their fixes are tracked in `documents/notes/known_errors.md`.
- Root `.env` and `frontend/.env` hold real local secrets (e.g. `JWT_PRIVATE_KEY`); both are gitignored — never print, paste, or commit their contents.
