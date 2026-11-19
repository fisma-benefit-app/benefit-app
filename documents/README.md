# Benefit documentation

Start with the task you need to complete. You do not need to read every guide before making a contribution or using the application.

For service links, log commands, and cache shortcuts, use the [project README](../README.md#services-and-environments).

## Choose a reading path

| Your task | Start here | Continue when needed |
| --- | --- | --- |
| Restore an unavailable or failing service | [Incident response](guides/incident_response.md) | Environment identification, health/log checks, targeted recovery, and verification. |
| Perform a calculation or produce a report | [Using Benefit](guides/using_benefit.md) | [Calculation reference](references/centralized_calculations.md) for the implementation overview; worked FiSMA examples are a planned expansion of that reference. |
| Set up a development environment | [Development guide](guides/development.md) | [Architecture](references/architecture.md), then [Contributing](guides/contributing.md). |
| Change an existing feature | [Architecture](references/architecture.md#find-the-code-for-a-change) | The relevant subsystem reference below. |
| Build an integration or debug an HTTP request | [API reference](references/api.md) | [OpenAPI contract](references/api-docs.yaml) and [authentication internals](guides/authentication.md). |
| Deploy or take over the service | [Deployment and operations](guides/deployment_guide.md) | [Database](guides/database.md), platform guidance, and [release versioning](guides/versioning.md). |
| Review a dependency alert | [Trivy guide](guides/trivy.md) | Existing GitHub alerts/issues and [security assessment guidance](guides/security_audit.md). |
| Work with a coding agent | [AGENTS.md](../AGENTS.md) | The same human documentation; [CLAUDE.md](../CLAUDE.md) redirects to the shared instructions. |

## Understand a subsystem

| Topic | Authoritative explanation |
| --- | --- |
| System boundaries and request flow | [Architecture](references/architecture.md) |
| Contexts, local state, debounce, save sequencing | [State management](references/state_management.md) |
| JWTs, renewal, logout, and password-change invalidation | [Authentication](guides/authentication.md) |
| Inputs, calculation entry points, and totals | [Calculation reference](references/centralized_calculations.md) |
| HTTP methods, permissions, fields, and error recovery | [API reference](references/api.md) |
| Database initialization, connections, and migrations | [Database guide](guides/database.md) |
| Why the backend uses a layered package structure | [Backend architecture decision](references/adr_backend.md) |

The API owns the client-visible contract. Authentication explains its internal session mechanism. State management explains the browser's behavior. The database guide explains persistence. The calculation reference explains the point-calculation implementation and should grow to include externally checked worked examples.

## Operate and maintain

- [Incident response](guides/incident_response.md): start here during an outage; health, logs, caches, recovery, and verification.
- [Deployment guide](guides/deployment_guide.md): shared deployment guidance and Heroku procedures.
- [Scalingo setup](guides/scalingo_deployment.md) and [Scalingo maintenance](guides/scalingo_maintenance.md): installation and routine operation. These are planned for consolidation.
- [Self-hosted / UpCloud guide](guides/upcloud_deployment.md): production-style Docker setup.
- [Database guide](guides/database.md): migration and initialization boundaries.
- [Versioning](guides/versioning.md): release branches, tags, and release notes.
- [API documentation maintenance](guides/generate_api_docs.md): maintain the reference and export OpenAPI.
- [Security assessment](guides/security_audit.md): scope, evidence, limitations, and retesting.

Scalingo backend deployment mode is controlled in the provider dashboard. The maintenance guide records it as disabled on 2026-11-14; verify the current setting before relying on automatic deployment. The frontend workflow runs separately.

## Current documentation and historical records

The [archive index](archive/README.md) contains earlier installation guides, sprint reports, demonstrations, and dated security evidence. Use it for history; follow the active guides for current behavior.

Open defects and proposed improvements belong in [GitHub issues](https://github.com/fisma-benefit-app/benefit-app/issues). Release history belongs in [GitHub Releases](https://github.com/fisma-benefit-app/benefit-app/releases). Superseded Docker, reset, cache, logging, branching, and Heroku CLI guides, historical error notes, and the September 2025 sprint changelog have been archived. Their current replacements are listed in the archive index.

## Keeping these documents current

| When you change… | Review… |
| --- | --- |
| An endpoint, permission, field, or error | API reference and OpenAPI; the corresponding internal guide when its mechanism changes. |
| UI state or saving | State management and architecture; the user guide if the workflow changes. |
| Point math or report figures | Calculation reference, expected-value tests, and relevant user explanations. |
| Compose, environment variables, profiles, or migrations | Development/database guidance and the affected platform runbook. |
| CI, releases, or hosting settings | Contribution/release guidance, pre-PR skill, and deployment procedures. |

This index routes readers; it does not repeat the full procedures. Source files and workflows remain the evidence against which those procedures are checked.
