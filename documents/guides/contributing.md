# Contribute to Benefit

Use this guide to turn a scoped change into a reviewable pull request. Start with [Development](development.md) to run the app, and [Architecture](../references/architecture.md) to find the code. Coding agents also follow [AGENTS.md](../../AGENTS.md).

## Start with one problem

Use an existing issue or open one describing the trigger, current result, and expected result. Keep one PR focused on that issue. Put unrelated defects and improvements in their own issues rather than expanding the change.

Benefit uses trunk-based development: work branches start from `main` and return through PRs. With a clean checkout, typical commands are:

```bash
git switch main
git pull --ff-only origin main
git switch -c 'issue/#123-short-description'
```

Replace `123` with the real issue number. Use `bugfix/#123-description` for fixes or `chore/description` for small chores, following the established repository naming scheme. Work on a branch you are authorized to push; use your normal fork workflow when direct repository write access is unavailable.

## Make the smallest complete change

- Reuse the existing component, helper, service, or platform capability before adding another abstraction or dependency.
- Trace callers so the shared cause is fixed once, and remove code made unused by the change.
- Keep backend business decisions in services. Controllers handle HTTP; repositories handle persistence; mappers handle conversion.
- Use the shared calculation entry points; avoid introducing separate point formulas in UI, export, or report code.
- Keep authorization, input validation, and data-preservation requirements intact. Check owner/member, latest-version, and stale-save behavior when changing project updates.
- A schema change needs the development schema and a new manual migration. Shared configuration must not auto-seed testing or production. See [Database](database.md).

## Choose tests for behavior

Backend behavior changes should have focused coverage appropriate to the risk, especially for authorization, validation, persistence, and concurrent updates. Follow existing test patterns; integration tests need disposable PostgreSQL.

Frontend tests are intentionally limited. Add a frontend unit test when all four apply:

1. The logic is pure inputs-to-output and needs no DOM, React rendering, or mocks.
2. A wrong result would be silent, such as a calculation or report figure.
3. The expected value comes from the method, hand arithmetic, or an independent invariant.
4. It asserts behavior through module exports rather than implementation details.

For a bug meeting those criteria, include the regression test. Text, styling, React rendering, and API-wrapper tests are not part of the current frontend test strategy. Use type checking, linting, and a browser check for those changes. Do not create a new test solely to assert a changed label or duplicate the implementation.

## Run the relevant checks

The tracked [CI workflow](../../.github/workflows/run-checks-on-pr.yml) defines the automated checks. The [pre-PR skill](../../.claude/skills/pre-pr-check/SKILL.md) is the reusable local procedure.

| Changed area | Local checks |
| --- | --- |
| Frontend | Prettier, ESLint with no warnings, `tsc -b`, and `npm test`, from `frontend/`. |
| Backend | `./gradlew spotlessCheck test --continue`, from `backend/`, with disposable PostgreSQL running. |
| Both | Both sets. |
| Documentation only | Review rendered output, links, commands, and the affected source contract. Exercise examples where behavior or command accuracy is in question. |

See [Development](development.md#run-checks) for commands and prerequisites. Run the complete relevant set before opening the PR; CI may run checks beyond the locally affected area. Report checks that could not run and why. A passing automated suite does not replace checking the changed user workflow.

Enable `.githooks` as described in Development. The commit hook formats staged frontend/backend files and stages the results, so inspect the resulting diff.

## Update the right documentation

| Change | Documentation to review |
| --- | --- |
| Endpoint, DTO, status, permission, or request behavior | [API reference](../references/api.md), exported OpenAPI, and examples. |
| Authentication, renewal, storage, or session invalidation | [Authentication](authentication.md) and client-visible API guidance. |
| State, autosave, ordering, or conflict handling | [State management](../references/state_management.md); architecture if boundaries change. |
| Calculation or report figures | [Calculation reference](../references/centralized_calculations.md), independent expected-value tests, and user-facing explanation. |
| Environment, profile, Compose, or schema | Development/database guidance and the affected deployment procedure. |
| A user workflow or control | [Using Benefit](using_benefit.md), with current wording and permissions. |

API maintenance follows [this procedure](generate_api_docs.md); the export script refreshes OpenAPI without overwriting the human reference. Record significant architecture decisions when they actually change; do not invent retrospective rationale.

## Open a PR a maintainer can assess

The title states the resulting behavior. In the description, include:

- The problem and a concrete before/after example when useful.
- The implemented behavior and any meaningful compatibility or migration effect.
- Relevant checks and manual verification, including material limits.
- `Closes #123` when merging the PR should resolve that issue.

Review your own final diff first, including formatting-hook changes. Exclude generated build output, real environment files, credentials, and unrelated work. Include intentional generated documentation or diagram exports with their sources.

Required checks and applicable repository rules must pass before merging. Peer review is especially useful for complex, high-risk, or domain-sensitive changes; follow current branch protection and team policy rather than assuming every change has the same approval requirements.

## Releases and follow-up

Merging a code change and cutting a release are separate actions. Use the [versioning guide](versioning.md) only when preparing an explicitly intended release. It explains the version-bump branch, tag workflow, and release notes.

Keep unresolved limitations in issues. Documentation should explain current behavior and link to the issue where that helps a reader act; it should not maintain a competing backlog.
