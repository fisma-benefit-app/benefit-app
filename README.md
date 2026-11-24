[![Contributors][contributors-shield]][contributors-url]
[![Last commit][commit-shield]][commit-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<div align="center">
  <a href="https://www.fisma.fi/">
    <img src="https://www.fisma.fi/images/cropped-Fisma_logo.png" alt="FiSMA shield" width="200">
  </a>
  <a href="https://www.haaga-helia.fi/en">
    <img src="https://www.haaga-helia.fi/themes/custom/hh/logo.png" alt="Haaga-Helia shield" width="200">
  </a>
</div>

# Benefit

Benefit is a function point analysis tool for the **FiSMA 1.1 method**. Use it to record functional requirements, calculate functional size, manage calculation versions, share projects, and export PDF and CSV reports.

Developed in collaboration with [FiSMA ry](https://www.fisma.fi/) and [Haaga-Helia University of Applied Sciences](https://www.haaga-helia.fi/en).

## Service down or behaving unexpectedly?

Start with the [incident response guide](documents/guides/incident_response.md). It walks through identifying the environment, checking health and logs, choosing a recovery action, and confirming the service works again. You do not need to understand the architecture first.

## Services and environments

| Service | Open |
| --- | --- |
| Production | [Benefit](https://fisma-benefit-app.github.io/benefit-app/#/login) |
| Scalingo testing | [Testing app](https://fisma-benefit-app-testing.github.io/scalingo/#/login) |
| Local frontend | [localhost:5173/benefit-app/login](http://localhost:5173/benefit-app/login) |
| Local backend health | [localhost:8080/actuator/health](http://localhost:8080/actuator/health) |

## Quick reference

Run Docker commands from the repository root. Hosted log commands require the relevant CLI and account access.

| I need to… | Where to look or what to run |
| --- | --- |
| Read local backend logs | `docker compose logs -f backend` |
| Read local frontend logs | `docker compose logs -f frontend`; browser errors appear in DevTools → Console |
| Read production backend logs | `scalingo --app benefit --region osc-fr1 logs --follow` |
| Read Scalingo testing backend logs | `scalingo --app benefit-testing --region osc-fr1 logs --follow` |
| Check hosted health, status, and recent changes | [Environment checks](documents/guides/incident_response.md#identify-and-check-the-environment) |
| Read self-hosted server logs | On the server checkout: `docker compose -f docker-compose.prod.yaml logs --tail=200 backend` |
| Find build, test, or deployment logs | [GitHub Actions](https://github.com/fisma-benefit-app/benefit-app/actions) |
| Refresh frontend caches | See [Caches](#caches) below |
| Deploy or check what is running | [Deployment and operations](documents/guides/deployment_guide.md) |
| Investigate a database problem | [Database guide](documents/guides/database.md); take a backup before changing a hosted database |
| Report a bug or find known work | [GitHub issues](https://github.com/fisma-benefit-app/benefit-app/issues) |

### Caches

For a stale page, first try a hard reload in the browser. To clear Vite's dependency cache in the Docker development stack, then restart the frontend:

```bash
docker compose exec frontend rm -rf node_modules/.vite
docker compose restart frontend
```

For a frontend running outside Docker, stop its dev server and run `npm run dev -- --force` from `frontend/`.

For local build or cache problems, see the [development guide](documents/guides/development.md). For hosted build failures, see the [Scalingo deployment cache](documents/guides/incident_response.md#scalingo-deployment-cache).

## Find what you need

| I want to… | Start here |
| --- | --- |
| Understand what FiSMA 1.1 measures and what to count | [FiSMA 1.1 Method Overview](documents/guides/using_benefit.md#fisma-11-method-overview) |
| Perform an analysis, manage versions, or export a report | [Using Benefit](documents/guides/using_benefit.md) |
| Run the app locally and make a first change | [Development guide](documents/guides/development.md) |
| Understand the architecture and find the relevant code | [Architecture](documents/references/architecture.md) |
| Submit a fix or improvement | [Contributing](documents/guides/contributing.md) |
| Make API requests or debug an integration | [API reference](documents/references/api.md) |
| Understand or verify the calculation rules | [Calculation reference](documents/references/centralized_calculations.md) |
| Deploy, maintain, or take over the service | [Deployment and operations](documents/guides/deployment_guide.md) |

The [documentation index](documents/README.md) links to the detailed guides, technical references, and historical archive.

<a id="setting-up-development-environment"></a>

## Run locally

You need **Git** and **Docker with Docker Compose**. Start Docker before running these commands:

```bash
git clone https://github.com/fisma-benefit-app/benefit-app.git
cd benefit-app

cp .env.example .env
cp frontend/.env.example frontend/.env

docker compose up --build -V
```

The example environment files provide defaults for local development. The initial build may take a few minutes.

- Open the app at [localhost:5173/benefit-app/login](http://localhost:5173/benefit-app/login).
- Sign in with the development account **`user` / `user`**.
- Check backend health at [localhost:8080/actuator/health](http://localhost:8080/actuator/health).

The development profile **deletes and reseeds the local database on backend startup**. Use disposable local data for this setup.

Stop the stack with:

```bash
docker compose down
```

For development without Docker, environment settings, checks, and troubleshooting, see the [development guide](documents/guides/development.md).

## Understand the codebase

| Directory | Responsibility |
| --- | --- |
| [`frontend/`](frontend/) | React, TypeScript, and Vite. User interface, application state, point calculations, and report generation. |
| [`backend/`](backend/) | Spring Boot and Java. REST API, authentication, permissions, project versioning, and persistence in PostgreSQL. |
| [`documents/`](documents/) | User and developer guides, technical references, and historical records. |

The [architecture reference](documents/references/architecture.md) explains the boundaries and data flow. For specific behavior, follow its links to authentication, state management, database, and calculation documentation.

## Contribute

Start from `main`, keep each pull request focused on one issue, and run the checks relevant to your change. See [Contributing](documents/guides/contributing.md) for the workflow and review expectations.

Changes to behavior should include the corresponding documentation update. Coding agents should also read [AGENTS.md](AGENTS.md).

Release maintainers should follow the [versioning guide](documents/guides/versioning.md) when preparing a release.

## northernSCOPE™ Concept

The [northernSCOPE™](https://www.fisma.fi/media/northernscope-brochure-v152.pdf) concept is a framework developed and provided by FiSMA to support the application of function point analysis in software projects.

## License

Benefit is distributed under the [MIT License](LICENSE).

## Contact

Representative supervisor: Heikki Naski, FiSMA ry

Project: [fisma-benefit-app/benefit-app](https://github.com/fisma-benefit-app/benefit-app)

[contributors-shield]: https://img.shields.io/github/contributors/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[contributors-url]: https://github.com/fisma-benefit-app/benefit-app/graphs/contributors
[commit-shield]: https://img.shields.io/github/last-commit/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[commit-url]: https://github.com/fisma-benefit-app/benefit-app/commits/main/
[issues-shield]: https://img.shields.io/github/issues/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[issues-url]: https://github.com/fisma-benefit-app/benefit-app/issues
[license-shield]: https://img.shields.io/github/license/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[license-url]: https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/LICENSE
