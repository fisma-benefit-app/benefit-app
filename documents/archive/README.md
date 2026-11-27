# Historical documentation

These documents preserve earlier project decisions, sprint records, and procedures. Start with the [current documentation index](../README.md) for onboarding or operations.

## Archived on 2026-11-27

The self-hosted and Heroku deployment procedures are historical. Use the [deployment guide](../guides/deployment_guide.md) for current environments.

- [Self-hosted Docker deployment](self_hosted_deployment_2026-11-27.md)
- [UpCloud walkthrough](upcloud_deployment_2026-11-27.md)
- [Heroku deployment](backend_heroku_deployment.md) and [Heroku CLI access](heroku_cli_setup_2026-11-19.md)

## Consolidated on 2026-11-19

Useful setup, troubleshooting, CLI, log, and cache instructions were carried into the active guides before these originals were archived. Outdated configuration examples and broad destructive resets were not promoted into current instructions.

| Archived document | Replacement |
| --- | --- |
| [Local Docker setup](docker_setup_2026-11-19.md) | [Current guidance](../guides/development.md) |
| [Local project reset](reset_installation_2026-11-19.md) | [Current guidance](../guides/development.md#reset-this-local-project) |
| [Cache troubleshooting](caching_2026-11-19.md) | [Current guidance](../guides/incident_response.md#caches-target-the-failing-layer) |
| [Logs and service recovery](logging_2026-11-19.md) | [Current guidance](../guides/incident_response.md) |
| [Contribution workflow](branching_strategy_2026-11-19.md) | [Current guidance](../guides/contributing.md) |
| [Heroku CLI access](heroku_cli_setup_2026-11-19.md) | [Current guidance](../guides/incident_response.md#scalingo-status-and-logs) |
| [Historical error notes](known_errors_2026-11-19.md) | [Current guidance](../guides/development.md#troubleshoot-by-symptom) |
| [Sprint 9, September 2025](changelog_2026-11-19.md) | [Current guidance](https://github.com/fisma-benefit-app/benefit-app/releases) |

Other files in this directory predate this consolidation and retain their original names. They are historical evidence, not current runbooks. Current platform guidance is linked from the documentation index.
