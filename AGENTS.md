# AGENTS.md

Guidance for AI coding agents (Claude Code, GitHub Copilot, Gemini, etc.) working in this repository.

## Project overview

Benefit is a function point analysis tool (FiSMA 1.1 method / ISO/IEC 29881) built for FiSMA ry and Haaga-Helia UAS. It's a monorepo with a Spring Boot backend and a React/TypeScript frontend.

## Coding approach

Make the smallest change that fully solves the task. Before writing code, take the first option that works:

1. Does it need to exist? Don't add features, options or flexibility nobody asked for, and say in one line what you left out.
2. Is it already in the codebase (a helper, hook, component, `lib/` function, service)? Reuse it the way the surrounding code does.
3. Does the language, framework or platform already do it (Java standard library, Spring, browser APIs)? Use that.
4. Is it in an installed dependency? Use it, and don't add a dependency for a few lines.
5. Otherwise write the minimum code that works.

- No speculative abstraction, wrapper, config option or "for later" code. Deleting beats adding: remove code your change makes dead (`npm run knip` finds unused frontend files, exports and dependencies).
- Be lazy about the solution, never about the change: update every caller, test and fixture it touches. For a bug, grep the callers and fix the root cause once, in the shared code.
- Don't cut corners on validation of API input, JWT/auth checks, error handling that prevents data loss, or anything the user asked for. Keep business logic in `service/` as the ADR requires. Point math lives only in `lib/centralizedCalculations.ts`, and a wrong number ships silently, so correctness wins over brevity there.
- Tests follow "What earns a frontend test" below: most changes need none.
- End your reply with one or two lines on what you skipped or could not verify.

## Commands

### Running the app locally

```bash
# Full Dockerized setup (build on first run or when Dockerfiles/package.json change;
# -V refreshes the node_modules volume so new npm deps show up)
docker compose up --build -V

# Stop (keep DB data/caches) / stop and wipe everything
docker compose down
docker compose down -v
```

Frontend: http://localhost:5173/benefit-app/login · Backend: http://localhost:8080/actuator/health · Dev login: `user` / `user`

Without Docker: run only the DB via `docker compose up db`, then `cd backend && SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun` and `cd frontend && npm install && npm run dev`. The `dev` profile deletes and reseeds the database, and the backend refuses to start under it against a non-local database; plain `./gradlew bootRun` (default profile) never seeds. `JWT_PRIVATE_KEY` is optional only under `dev` (an empty value falls back to the public dev key in `application-dev.yaml`); every other profile requires it and rejects the dev key.

### Backend (`backend/`)

```bash
./gradlew bootRun                                    # run (default profile, no seeding)
./gradlew build                                       # build
./gradlew test                                        # run all tests (needs Postgres — `docker compose up db` first)
./gradlew test --tests fi.fisma.backend.YourTestClass # run a single test class
./gradlew spotlessCheck                                # check formatting (Google Java Format)
./gradlew spotlessApply                                # auto-fix formatting
```

### Frontend (`frontend/`)

```bash
npm run dev                # dev server
npx eslint . --max-warnings 0 # lint (CI fails on any warning)
npx tsc -b                  # type-check (not `tsc --noEmit`: the root tsconfig.json has no files of its own)
npx prettier . --write      # format
npm run build:testing        # build for testing env (needs frontend/.env)
npm run build:production     # build for production env
npm run format:check         # check formatting, like CI does
npm test                    # unit tests (Vitest)
npm run knip                 # find unused files, exports and dependencies (needs frontend/.env; not run in CI)
```

Frontend unit tests use Vitest (`npm test`, which runs `vitest run`) and live next to the code as `src/**/*.test.ts`. The suite is deliberately small: it covers the report's previous-version comparison (`lib/reportComparison.ts`), the point math (`lib/centralizedCalculations.ts`) and the figures behind the overview report's architecture diagram (`lib/pdf/architectureDiagramData.ts`). Everything else relies on TypeScript (`tsc -b`), ESLint, Prettier, `run-checks-on-pr.yml` (which runs `npm test`) and manual verification. `vitest.config.ts` is separate from `vite.config.ts` on purpose: the latter throws when `VITE_API_URL` is unset.

**What earns a frontend test.** Add one only if all of these hold, otherwise leave it out:

1. It is pure logic (inputs to output), so the test needs no mocks, DOM or React rendering.
2. A wrong result would be silent: it ships in a number or a report and nothing crashes or looks off. Loud failures are already caught by `tsc`, ESLint and a glance at the screen.
3. The expected value comes from outside the code (the FiSMA spec, hand arithmetic, or an invariant such as "layer totals sum to the grand total"), never from pasting what the code currently returns.
4. It asserts behaviour through the module's exports, so a refactor that keeps behaviour does not touch it.

When fixing a bug in logic that passes 1-4, add the regression test in the same PR. No snapshot tests, no component tests, no tests of `api/` fetch wrappers or of text and styling. If a test fails because behaviour was changed on purpose, update it deliberately; if that keeps happening, delete it.

### Formatting hook

A pre-commit hook (`.githooks/pre-commit`) runs Prettier on staged frontend files and Spotless on staged backend files, then re-stages them. Enable it once per clone with:

```bash
git config core.hooksPath .githooks
```

## Architecture

### Backend — layered Spring Boot (`backend/src/main/java/fi/fisma/backend/`)

Per the backend ADR (`documents/references/adr_backend.md`), the backend is intentionally organized by layer, not by feature:

- `api/` — REST controllers (`ProjectController`, `FunctionalComponentController`, `CommentController`, `AppUserController`)
- `domain/` — JPA entities (`Project`, `FunctionalComponent`, `AppUser`, `Comment`, `ProjectAppUser`, `RevokedToken`)
- `dto/` — request/response DTOs
- `mapper/` — domain ↔ DTO conversion
- `service/` — business logic orchestrating repositories/mappers
- `repository/` — Spring Data JPA interfaces
- `security/` — JWT auth (`TokenController`, `AuthController`, `TokenService`, `JwtRevocationFilter`, `TokenBlacklistService`, `LoginAttemptThrottleService`, `UserDetailsServiceImpl`, `SecurityConfig`)
- `exception/` — `GlobalExceptionHandler` and custom exceptions
- `config/` — startup guards (`DevProfileDatabaseGuard`, `RequiredConfigGuard`) and `OpenApiConfig`

Keep business logic in `service/`, not in controllers or repositories — that discipline is the explicit tradeoff called out in the ADR for this layered structure.

**Auth flow** (read `documents/guides/authentication.md` before working on authentication, sessions or `security/`): login is HTTP Basic against `POST /token`; the backend returns an RSA-signed JWT (signed with `JWT_PRIVATE_KEY`, so each environment has its own key pair) in the `Authorization: Bearer <jwt>` response header. The username is the `sub` claim, which is how the backend finds the user, so usernames can't be changed. Renewal is `POST /token` with the current token, and logout blacklists its `jti` in memory (`TokenBlacklistService`). Token lifetimes, the 30-day cap and the other details are in the guide.

**Database**: Postgres. Only the `dev` profile initializes the database (`schema-dev.sql` and `database-seed-dev.sql` in `backend/src/main/resources/`, on every start); the shared `application.yaml` sets `spring.sql.init.mode: never` (do not change it), so testing and production are never seeded or changed automatically. **Migrations are manual**: add SQL files under `backend/src/main/resources/migrations/` and apply them by hand per environment (see `documents/guides/database.md`), so a schema change needs both a `schema-dev.sql` update and a new migration file. On the self-hosted server (`docker-compose.prod.yaml`), `./update_server.sh` applies them and records them in a `schema_migrations` table.

### Frontend — React + TypeScript + Vite (`frontend/src/`)

- `components/` — page/feature components (`ProjectPage`, `ProjectList`, `FunctionalClassComponent`, `FunctionalPointSummary`, modals, etc.)
- `context/` + `hooks/` — global state via React Context: `AppUserContext`/`useAppUser` (auth/session, persisted to `sessionStorage`) and `ProjectsContext`/`useProjects` (all projects, CRUD). See `documents/references/state_management.md` for the full data-flow diagram and patterns (debounced auto-save via a ref to avoid stale closures, `isLatest` gating on edits, orderPosition normalization on fetch).
- `api/` — fetch wrappers per resource (`project.ts`, `comments.ts`, `authorization.ts`, `profile.ts`)
- `lib/` — `centralizedCalculations.ts` (the single source of truth for point math, see `documents/references/centralized_calculations.md`), `calculations.ts`, `types.ts`, `calculationReportUtils.ts`/`overviewReportUtils.ts` (the two PDF reports, built as text-based pdfmake documents; shared layout helpers and the lazy pdfmake loader live in `lib/pdf/`), `quickCalculation.ts` (the quick calculator's average items, sized and turned into project components through the real component calculations, so it holds no point math of its own), `csvExportUtils.ts`, `printUtils.ts` (date/component helpers), `jwtUtils.ts`, `translations.ts`, `fc-constants.ts`/`fc-service-functions.ts` (functional component class/type config)

**Project versioning**: projects sharing a `projectName` are versions of each other; only the latest is editable (`checkIfLatestVersion`), and archiving creates a new version instead of overwriting. `ProjectService.createProjectVersion` sets each copied component's `previousFCId` to the original's ID, which remaps parent/subcomponent links and lets the PDF export show per-field diffs against the previous version. It is `null` for version-1 components and components added later, and unrelated to `orderPosition` (see `documents/references/state_management.md`).

**Env vars**: `VITE_API_URL` is required (Vite build fails without it — see `vite.config.ts`); `VITE_BASE_PATH` is required for `testing`/`production` mode builds.

### FiSMA 1.1 domain model

A `Project` contains `FunctionalComponent`s. Each component has a `className`/`componentType`, a `degreeOfCompletion` (0.0–1.0), an `orderPosition` (drag-and-drop order), and class-specific FP inputs (`dataElements`, `readingReferences`, `writingReferences`, `functionalMultiplier`, `operations`). Functional size is measured strictly from functional requirements — technical features (logging, caching) are explicitly out of scope for point calculations.

## CI/CD

- Trunk-based development: all work merges to `main` via PR (see `documents/guides/branching_strategy.md`). Development branches are named `issue/#XXX-description` (features), `bugfix/#XXX-description`, or `chore/description`; keep each PR scoped to one issue — unrelated changes get their own issue and PR.
- `run-checks-on-pr.yml` (GitHub Actions) runs on every PR and must pass: backend Spotless check and tests (against a Postgres service container), frontend Prettier check, ESLint (no warnings allowed), type check (`tsc -b`) and unit tests (`npm test`). PR authors review their changes and merge after the required checks and appropriate testing pass. Peer review is encouraged for complex or high-risk changes, but is not generally required.
- Before opening a PR: link it to its issue and run the same checks locally first (the `pre-pr-check` skill does this).
- Merges to `main` auto-deploy the testing environments: Heroku backend + GitHub Pages frontend (`/benefit-app/testing/`), and the Scalingo testing environment (backend via Scalingo's own GitHub auto-deploy, frontend at `/benefit-app/scalingo-testing/` via `deploy-scalingo-testing-frontend.yml`); see `documents/guides/deployment_guide.md`. Production deploys are triggered manually from Heroku, then GitHub Actions rolls the frontend to GitHub Pages (`run-deployments.yml`).
- Version bumps use `./update_version.sh X.Y.Z`, which opens a `chore/update-version-to-X.Y.Z` PR; merging it auto-creates the `vX.Y.Z` git tag (`create-release-tag.yml`). See `documents/guides/versioning.md`. Only run this when explicitly asked to cut a release — merging its PR is not easily reversible.

## Skills and hooks

Repeatable multi-step procedures live as agent skills in `.claude/skills/<name>/SKILL.md`. Agents load them on demand (Claude Code reads them natively; other tools can read the files directly). This file stays the source of always-on facts; skills link here instead of repeating it.

- `pre-pr-check`: run the CI checks locally before opening a PR.

Add a skill only for a procedure that is repeated and has more than a couple of steps. Keep its `description` specific about when to use it, since that is all the agent sees until the skill loads.

A `SessionStart` hook (`.claude/hooks/ensure-frontend-deps.sh`, registered in `.claude/settings.json`) runs `npm ci` in `frontend/` when `node_modules` is missing, as in a fresh worktree, and does nothing otherwise. It only runs in Claude Code; with other tools run `npm ci` yourself.

## Notes

- API docs are generated via SpringDoc + Widdershins; refresh with the steps in `documents/guides/generate_api_docs.md` (`npx widdershins`, not installed as a dependency because it causes `npm audit` issues).
- Known local-dev issues and their fixes are tracked in `documents/notes/known_errors.md`.
- Root `.env` and `frontend/.env` hold real local secrets (e.g. `JWT_PRIVATE_KEY`); both are gitignored — never print, paste, or commit their contents.
- A fresh git worktree has none of the gitignored files. `.worktreeinclude` makes Claude Code copy `.env` and `frontend/.env` into new worktrees (copy them from the main checkout yourself if you create a worktree another way); `frontend/node_modules` is installed by the hook described under "Skills and hooks". Compose uses fixed container names and ports, so only one stack can run at a time, and the `dev` profile reseeds the database on every start.
