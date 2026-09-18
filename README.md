<a id="readme-top"></a>

<!-- BANNER SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Last commit][commit-shield]][commit-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TITLE -->

<br />
<div align="center">
  <a href="https://www.fisma.fi/">
    <img src="https://www.fisma.fi/images/cropped-Fisma_logo.png" alt="FiSMA shield" width="200">
  </a>
  <a href="https://www.haaga-helia.fi/en">
    <img src="https://www.haaga-helia.fi/themes/custom/hh/logo.png" alt="Haaga-Helia shield" width="200">
  </a>

  <h3 align="center">Benefit application</h3>

  <p align="center">
    All in one repository for the Benefit application developed in collaboration
    <br /> between FiSMA ry and Haaga-Helia University of Applied Sciences.
    <br />
    <a href="#quick-reference"><strong>Quick reference »</strong></a></br>
    <a href="#setting-up-development-environment"><strong>Installation and development »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

<br>
<details>
<summary><b>Table of Contents</b></summary>
  <ol>
    <li><a href="#about-the-project">About the Project</a></li>
    <li><a href="#quick-reference">Quick Reference</a></li>
    <li><a href="#service-and-environments">Service and Environments</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#logs">Logs</a></li>
    <li><a href="#caches">Caches</a></li>
    <li><a href="#database-access">Database Access</a></li>
    <li><a href="#database-initialization">Database Initialization</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#fisma-11-method-overview">FiSMA Method Overview</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#setting-up-development-environment">Setting up Development Environment</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#cicd">CI/CD</a></li>
    <li><a href="#quality-assurance-and-security">Quality Assurance and Security</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details><br>

<!-- ABOUT THE PROJECT -->

## About the Project

The Benefit application has been developed in collaboration with FiSMA ry and Haaga-Helia University of Applied Sciences. It's designed for function point analysis (see [method overview](#fisma-11-method-overview)), primarily supporting Scope Managers in performing calculations, reporting, and archiving. The main functionality of the app follows standard ISO/IEC 29881.

### What is Function Point Analysis?

Function point analysis is used to measure the functional size of software. This measurement can then be applied when analyzing productivity or preparing workload estimates.

There are several function point analysis methods, but in this project, the term specifically refers to the FiSMA 1.1 method.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- QUICK REFERENCE -->

## Quick Reference

The things people ask about most often:

| Question                                            | Answer                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Where is the service?**                           | [https://fisma-benefit-app.github.io/benefit-app/#/login](https://fisma-benefit-app.github.io/benefit-app/#/login) — see [Service and Environments](#service-and-environments)                                                                        |
| **How do I get my changes to production?**          | Merge your PR to `main` (auto-deploys to testing). For production: Heroku dashboard → `fisma-benefit-app` app → Deploy tab → select `main` → Deploy Branch. This triggers GitHub Actions to roll the frontend out too — see [Deployment](#deployment) |
| **Where are the logs?**                             | See [Logs](#logs) — location differs by backend/frontend and local/production                                                                                                                                                                         |
| **How do I flush caches?**                          | See [Caches](#caches) — covers frontend, backend, Heroku build cache, and the app's own calculation cache                                                                                                                                             |
| **Something's wrong with the production database?** | Back it up first: `heroku pg:backups:capture --app=fisma-benefit-app`. Connect: `heroku pg:psql HEROKU_PRODUCTION_POSTGRES_DB_NAME --app=fisma-benefit-app` — see [Database Access](#database-access)                                                 |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SERVICE AND ENVIRONMENTS -->

## Service and Environments

| Environment          | URL                                                             |
| -------------------- | --------------------------------------------------------------- |
| Production frontend  | https://fisma-benefit-app.github.io/benefit-app/#/login         |
| Testing frontend     | https://fisma-benefit-app.github.io/benefit-app/testing/#/login |
| Local frontend (dev) | http://localhost:5173/benefit-app/login                         |
| Local backend (dev)  | http://localhost:8080/actuator/health                           |

Access to the repo: https://github.com/fisma-benefit-app/benefit-app

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->

## Deployment

We can deploy the app to two different environments: testing (staging) and production. Testing deployments run automatically and production deployments must be done manually.

Before any deployment, ensure a database backup is taken via Heroku or terminal. See [deployment guide](/documents/guides/deployment_guide.md).

Database migrations are manual. See [migrations](/backend/src/main/resources/migrations/).

### Prerequisites

- Heroku account with CLI installed for logging (see the [logging guide](/documents/guides/logging.md) if needed)
- Access to repo: https://github.com/fisma-benefit-app/benefit-app
- Database credentials available in Heroku Config Vars
- Heroku backend URLs set up in GitHub Actions repository secrets: `HEROKU_PRODUCTION_URL` and `HEROKU_TESTING_URL` (values can be found in the [backend-credentials repository](https://github.com/fisma-benefit-app/backend-credentials))

### Automatic deployments

Testing deployments run automatically after each merge to `main`. Production deployments are initiated from Heroku and then run automatically via GitHub Actions.

### Manual deployments

- Manual backend deployments to Heroku are done in the Heroku dashboard.
- Manual frontend deployments to GitHub Pages are done from the CLI.

See the [deployment guide](/documents/guides/deployment_guide.md) for more instructions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LOGS -->

## Logs

| Type of log      | Local                          | Heroku (Production)                          |
| ---------------- | ------------------------------ | -------------------------------------------- |
| Backend runtime  | Terminal (`./gradlew bootRun`) | `heroku logs --app fisma-benefit-app --tail` |
| Frontend build   | Terminal (`npm run dev`)       | GitHub Actions build logs                    |
| Frontend runtime | Browser DevTools console       | Browser DevTools console                     |
| Test logs        | `./gradlew test`               | CI/CD logs (GitHub Actions/Heroku)           |

Log in to Heroku if needed (do not use Git Bash on Windows):

```sh
heroku login
```

Tail production logs:

```sh
heroku logs --app fisma-benefit-app --tail
```

For full logging information, see the [logging guide](/documents/guides/logging.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CACHES -->

## Caches

#### Frontend

- **Browser cache & cookies**: Clear from browser settings (e.g. on Firefox: Settings → Privacy & Security → Clear browsing data).
- **Vite pre-bundling cache**: Vite caches optimized dependencies locally. To clear:

  ```sh
  rm -rf node_modules/.vite
  ```

#### Backend

Spring caches are not used by default, but if enabled, see the Spring Cache Reference:

```sh
./gradlew clean build --no-build-cache
rm -rf ~/.gradle/caches/
```

#### Heroku

Heroku keeps cached build artifacts between deploys. To purge the build cache (requires the Heroku Labs plugin):

```sh
heroku plugins:install heroku-builds
heroku builds:cache:purge -a fisma-benefit-app
```

#### App-specific memoization cache

Benefit's memoization cache is used for functional point calculations in the frontend, specifically in `centralizedCalculations.ts`. To clear it, run `clearCalculationCache()` via devtools.

For more details, see the [Caching Guide](/documents/guides/caching.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATABASE ACCESS -->

## Database Access

<details>
<summary><b>Local Database (Docker)</b></summary>

<br>

For development, Postgres runs inside Docker Compose. See `docker-compose.yaml` in the project root for the container name, user, password, and database — by default: container `fisma_db`, database `fisma_db`, user `myuser`, password `secret`, host port `5433`.

#### Access via Docker

```sh
docker exec -it fisma_db psql -U <username> <database>
```

#### Access via local psql

If you have PostgreSQL installed locally:

```sh
psql -h localhost -p 5433 -U <username> <database>
```

</details>

<details>
<summary><b>Production and Testing databases</b></summary>

<br>

See Heroku's dashboard or the `backend-credentials` repository for Heroku PostgreSQL database names.

#### Access via Heroku CLI

Log in (if needed):

```sh
heroku login
```

Connect to the production database:

```sh
heroku pg:psql HEROKU_PRODUCTION_POSTGRES_DB_NAME --app=fisma-benefit-app
```

Connect to the testing database:

```sh
heroku pg:psql HEROKU_TESTING_POSTGRES_DB_NAME --app=fisma-benefit-app-testing
```

Create a database backup:

```sh
heroku pg:backups:capture --app=fisma-benefit-app
```

Exit the database shell: `Ctrl + D`

#### Access via direct psql

You can also connect using credentials from the Heroku Dashboard:

```sh
psql -h <host> -p <port> -U <username> <database>
```

You'll be prompted for the password.

</details>

For more details, see the [database guide](/documents/guides/database.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATABASE INITIALIZATION -->

## Database Initialization

Schema initialization and seeding are controlled by Spring profiles, hardcoded in [`backend/src/main/resources/application.yaml`](backend/src/main/resources/application.yaml) — not by environment variables.

| Profile                | Used by                                                     | `spring.sql.init.mode`           | Schema / seed files                       |
| ---------------------- | ----------------------------------------------------------- | -------------------------------- | ----------------------------------------- |
| `default` (no profile) | Testing and Production (Heroku)                             | `never` — **do not change this** | none — schema changes only via migrations |
| `dev`                  | Local development (`docker compose` or `./gradlew bootRun`) | `always`                         | `schema-dev.sql`, `database-seed-dev.sql` |

- The `dev` profile is activated automatically for local development: `docker-compose.yaml` sets `SPRING_PROFILES_ACTIVE=dev` for the backend container, and `./gradlew bootRun` sets it via `build.gradle`.
- Production and testing never auto-initialize or reseed the schema; the only way schema changes reach those environments is through the manual [migrations](/backend/src/main/resources/migrations/).
- `DATABASE_INIT_MODE` and `DATABASE_SEED_FILE` are **not** used anymore — they used to be Heroku config vars controlling this, but a missing/misconfigured var could wipe production data (since the old default was `always`, and the schema file dropped tables). The mode is now hardcoded per profile instead, so there's no env var to forget.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ARCHITECTURE -->

## Architecture

<details>
<summary><b>Click here to view the software architecture</b></summary>
<img src="./documents/img/images_for_guides/architecture.jpg" height="500" />
</details>

<details>
<summary><b>Click here to view the database diagram</b></summary>
<img src="./documents/img/images_for_guides/database_diagram.png" height="508" width="1290"/>
</details><br>

More information on how to access the database can be found in the [database guide](/documents/guides/database.md).

### API

Benefit's API documentation is generated from the backend's live OpenAPI spec (SpringDoc) using Widdershins and Doctoc, run via `npx` (not installed as dependencies, since that causes `npm audit` problems).

It can be viewed [here](/documents/references/api.md). It is **not** regenerated automatically — refresh it after any API change by running `backend/scripts/generate_api_docs.sh` against a running local backend, following the [API guide](/documents/guides/generate_api_docs.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FISMA 1.1 METHOD OVERVIEW -->

## FiSMA 1.1 Method Overview

In FiSMA 1.1, each user-relevant function is classified into a function category and function type, and entered as a row in a table. Each function is assigned:

- A unique identifier
- Required measurable attributes, including:
  - Data elements
  - Read references
  - Write references
  - Operations
  - Function factor

Examples of functions:

- A list view on a web page
- A CSV report
- An integration
- A database table

Not considered functions:

- Technical features (e.g. internal logging, developer utilities)
- Quality-related features (e.g. caching)

These are excluded because they do not directly provide new functionality to the user. Functional size is measured strictly through functional requirements or working software features.

### northernSCOPE™ Concept

The [northernSCOPE™](https://www.fisma.fi/media/northernscope-brochure-v152.pdf) concept is a framework developed and provided by FiSMA to support the application of function point analysis in software projects.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUILT WITH -->

## Built With

This project is built with:

![Back-end][back-end-shield]<br>
[![Java][java-shield]][java-url]
[![Spring Boot][spring-shield]][spring-url]
[![Gradle][gradle-shield]][gradle-url]

![Front-end][front-end-shield]<br>
[![TypeScript][typescript-shield]][typescript-url]
[![React][react-shield]][react-url]

![Database][database-shield]<br>
[![PostgreSQL][postgres-shield]][postgres-url]

![Tools][tools-shield]<br>
[![Docker][docker-shield]][docker-url]
[![Figma][figma-shield]][figma-url]
[![GitHub][github-shield]][github-url]
[![GitHub Actions][github-actions-shield]][github-actions-url]
[![Visual Studio Code][vs-code-shield]][vs-code-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Setting up development environment

This guide explains how to set up the Benefit App locally for development.

### 1) Prerequisites

- **Docker Desktop 4.39.0 or newer** installed (and running).
- Or, for local-only dev (without a Dockerized backend):
  - a local **PostgreSQL** installation (or use only the dockerized database - see 3B)
  - **Java 21**
  - **Nodejs** and **npm** (latest LTS recommended)
  - (Optional) **Git** and a code editor (e.g. VS Code ≥ 1.98.2)

Check Java version:

```bash
java --version
echo $JAVA_HOME # or echo %JAVA_HOME% on Windows
```

If `JAVA_HOME` is unset or points to the wrong directory, Gradle builds may fail.

### 2) Setup

```bash
# clone
git clone <your-repo-url>
cd benefit-app

# root env
cp .env.example .env

# frontend env
cp frontend/.env.example frontend/.env
```

You can change the values as you wish, but the dev environment should usually work with the defaults.

<details>
<summary><b>Environment variable reference</b></summary>

<br>

**Root `.env`:**

| Variable                     | Default                                    | Purpose                                                |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `JWT_PRIVATE_KEY`            | _(none — required, see below)_             | Backend JWT signing key                                |
| `POSTGRES_DB`                | `fisma_db`                                 | Local database name                                    |
| `POSTGRES_USER`              | `myuser`                                   | Local database user                                    |
| `POSTGRES_PASSWORD`          | `secret`                                   | Local database password                                |
| `HOST_DB_PORT`               | `5433`                                     | Host port mapped to Postgres                           |
| `HOST_BACKEND_PORT`          | `8080`                                     | Host port mapped to the backend                        |
| `HOST_FRONTEND_PORT`         | `5173`                                     | Host port mapped to the frontend                       |
| `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://db:5432/${POSTGRES_DB}` | JDBC URL used inside Docker                            |
| `SPRING_DATASOURCE_USERNAME` | `${POSTGRES_USER}`                         | Datasource username                                    |
| `SPRING_DATASOURCE_PASSWORD` | `${POSTGRES_PASSWORD}`                     | Datasource password                                    |
| `CHOKIDAR_USEPOLLING`        | `true`                                     | File-watch polling (needed for Docker hot reload)      |
| `VITE_PORT`                  | `${HOST_FRONTEND_PORT}`                    | Port Vite listens on inside Docker                     |
| `API_DEBUG`                  | `always`                                   | Enables debug error details; use `never` in production |
| `API_DEBUG_LEVEL`            | `debug`                                    | Spring security log level; use `info` in production    |

**`frontend/.env`:**

| Variable              | Default                 | Purpose                          |
| --------------------- | ----------------------- | -------------------------------- |
| `VITE_API_URL`        | `http://localhost:8080` | Backend URL the frontend calls   |
| `VITE_PORT`           | `5173`                  | Local dev server port            |
| `CHOKIDAR_USEPOLLING` | `true`                  | File-watch polling               |
| `VITE_BASE_PATH`      | `/benefit-app/`         | Base path the app is served from |

See `.env.example` and `frontend/.env.example` for the source of truth — this table is a convenience summary and may drift from them over time.

</details>
<br>

### You must include the JWT_PRIVATE_KEY in your .env:

The backend JWT signing key is supplied through the `JWT_PRIVATE_KEY` environment variable and is **not stored in the public repository**. Copy the key from the **backend-credentials** file `JWT private key for local enviroment.md` and set it in the root `.env` file before starting the backend. Use the actual PEM content with real line breaks, for example:

```bash
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

Keep the key in your local `.env` only; do not commit it to the repository.

### 3) Run Options

#### A) Full Dockerized Setup

```bash
# start (build on first run or when Dockerfiles change)
docker compose up --build

# stop (keep DB data and caches)
docker compose down

# stop and reset EVERYTHING (DB, caches, volumes)
docker compose down -v
```

Open:

- Frontend: http://localhost:5173/benefit-app/login
- Backend: http://localhost:8080/actuator/health

Default credentials for development:

- Username: `user`
- Password: `user`

#### B) Development Without Docker (local backend)

1. You only need the `frontend/.env` file with `VITE_API_URL` pointing to your backend (`http://localhost:8080` by default).
2. If you have previously run Docker, clean backend build dirs once to avoid permission issues:
   ```bash
   sudo rm -rf backend/.gradle backend/build
   ```
3. Make sure a Postgres DB is available:
   - Run only Postgres via Docker:
     ```bash
     docker compose up db
     ```
   - Test the DB connection:
     ```bash
     docker exec -it fisma_db psql -U <username> <database>
     ```
   - Or use your own Postgres locally (check port/credentials in `backend/src/main/resources/application.yaml`).
4. Start the backend:

   ```bash
   cd backend
   ./gradlew bootRun
   ```

   Or build and run the packaged jar:

   ```bash
   ./gradlew build
   java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
   ```

5. Start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   By default, the app runs at `http://localhost:5173`.

   Default credentials for development:
   - Username: `user`
   - Password: `user`

### 4) Other steps

IMPORTANT! If you continue developing this app, it is important to keep consistent formatting in your changes. Benefit app has a `pre-commit` Git hook to run all necessary formatting on each commit. To take advantage of this, run this command in your terminal:

```sh
git config core.hooksPath .githooks
```

This command tells Git to look for the `pre-commit` hook in the `.githooks` folder.

### (Optional) Troubleshooting

<details>
<summary><b>Click to expand troubleshooting tips</b></summary>

<br>

- **No seed users** → confirm the `dev` Spring profile is active (see [Database Initialization](#database-initialization)) — Docker Compose and `./gradlew bootRun` set this automatically. Then reset the DB once.
- **Hot reload flaky in Docker** → keep `CHOKIDAR_USEPOLLING=true`. On Windows with WSL2, if **Spring Boot/Gradle hot reload** does not detect Java file changes, keep the repository in the WSL filesystem (e.g. `~/Projects/benefit-app`) rather than under `/mnt/c/...`, then run Docker Compose from the WSL project directory.
- **Java not detected / build fails** → Ensure `JAVA_HOME` points to your JDK 21 installation. Example (PowerShell):

  ```powershell
  $javaPath = Split-Path -Path (Split-Path -Path (Get-Command java).Source -Parent) -Parent
  setx /m JAVA_HOME $javaPath
  ```

- **Backend build errors** → Run `./gradlew clean build` and verify that `build.gradle` uses:

  ```gradle
  java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
  }
  ```

- **Database connection issues** → Double-check Docker is running, and test with `psql` as shown above. If using local Postgres, ensure the port and credentials match `application.yaml`.
- **Switching between Docker/local backend** → Always clean `backend/.gradle` and `backend/build` before switching.
- **Login fails with** `Error getting JWT ... Status: 404` or **Error fetching projects / JSON parse errors** → `VITE_API_URL` is likely misconfigured. Ensure it matches your backend's URL.
- `npm install` **fails (permissions)** → Remove the node_modules folder and try again:

  ```bash
  rm -rf node_modules
  npm install
  ```

#### See also: [List of known errors](/documents/notes/known_errors.md).

</details>

### (Optional) Notes

<details>
<summary><b>Click to expand notes</b></summary>

<br>

- Change host ports in `.env` if 5173/8080/5433 are taken.
- Use a DB GUI (e.g., DBeaver) with host `localhost`, port `5433`, db `fisma_db`, user `myuser`, pass `secret`.

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->

## Usage

### Login

- Login with username and password.
<details>
<summary><b>Click here to view an image of the login page</b></summary>
<img src="./documents/img/images_for_guides/UI_login_page_14_05_2025.png" height="500"/>
</details><br>

### Main View

- Create, save, and export (CSV, PDF) projects.
<details>
<summary><b>Click here to view an image of the front page</b></summary>
<img src="./documents/img/images_for_guides/UI_project_page_14_05_2025.png" height="500"/>
</details><br>

### Demos

Below are two demos of the app recorded on May 14 2025.

#### Part 1

- Login, create new project, calculate functional points, and view version control.

[Click here to see demo part 1](https://github.com/user-attachments/assets/1407d6b8-f1fe-47c1-9fae-3c74588a6606)

#### Part 2

- Export project, change language, delete project, and attempt login with faulty credentials.

[Click here to see demo part 2](https://github.com/user-attachments/assets/31b00e69-c9dc-461e-97cc-5a5dc96b96ba)

#### Troubleshooting

Both videos can be downloaded and watched [here](/documents/demo/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CI/CD -->

## CI/CD

Benefit application's CI/CD pipeline includes a branching strategy and automated checks through GitHub Actions.

### Branching Strategy

Developing the Benefit application is done using trunk-based development. Benefit application's branching strategy currently follows these guidelines:

- `main` branch: production and testing branch

All commits are merged to `main` via pull requests. These PRs go through automatic testing and, when merged, trigger automatic deployment to the testing environment. See [deployment](#deployment) for more information.

For the full explanation of the branching strategy, see the [branching strategy guide](./documents/guides/branching_strategy.md).

### GitHub Actions

The Benefit application's GitHub repository features a GitHub Actions workflow which runs automated checks and tests on every pull request. Only pull requests that pass all checks are allowed to merge. These checks are:

- formatting checks for frontend (Prettier) and backend (Spotless / Google Java Format)
- backend unit tests

Our automated deployments also use GitHub Actions workflows to deploy any merges to `main` to the testing environment. See [deployment](#deployment) for more information.

### Code Quality and Collaboration

The developer team minimizes errors and maintains good code quality by:

- merging all changes only through pull requests
- merging only quality code (i.e. pull requests pass all checks in GitHub Actions)
- requiring peer review and approval from another team member before merging
- resolving all conversations, comments, and/or change requests in GitHub

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- QUALITY ASSURANCE AND SECURITY -->

## Quality Assurance and Security

### Unit Tests

Benefit is covered by unit tests in the backend using JUnit and Mockito. These are configured in the `gradle.build` file. All tests can be run from the `backend/` folder using the command:

```bash
./gradlew test
```

or, if you want to run a specific test class:

```bash
./gradlew test --tests fi.fisma.backend.YourTestClass
```

### Authentication and Authorization

Basic authentication is used. After successful authentication, a JWT is generated and returned. A more detailed authentication guide can be found [here](documents/guides/authentication.md). Authenticated users are authorized with the role ROLE_USER.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Multilayer architecture
- [ ] Improve error management
- [ ] Improve quality assurance
- [ ] Improve project listing
  - [x] Implement search functionality
  - [ ] Improve edit functionality
  - [ ] Improve project sorting
- [ ] Update documentation
  - [ ] Document how Benefit handles login tokens (database to API, and vice versa) in `guides/authentication.md`
  - [ ] Document information security on JWTs and cookies
- [x] Compatibility with mobile

The project's requirement specification can be found [here](https://docs.google.com/document/d/1FXYXPMAwyoZNdxBxYVOIQPrcBr01fXAB4nvHD-Diy7w/edit?tab=t.0#heading=h.6dj02y3xjnh0). See the [open issues](https://github.com/fisma-benefit-app/benefit-app/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

If you have a suggestion to improve this project:

1. Fork the project
2. Set up the development environment ([see Setting up Development Environment](#setting-up-development-environment))
3. Create your feature branch and set up remotes

   ```bash
   # Clone your fork
   git clone https://github.com/your-username/benefit-app.git
   cd benefit-app

   # Add upstream remote
   git remote add upstream https://github.com/fisma-benefit-app/benefit-app.git

   # Create feature branch
   git checkout -b feature/amazing-feature
   ```

4. Make your changes
   - Follow our coding standards
   - Add tests if applicable
   - Update documentation as needed
5. Run formatting and tests

   ```bash
   # Frontend
   cd frontend
   npx prettier . --write

   # Backend
   cd backend
   ./gradlew spotlessApply
   ./gradlew test
   ```

6. Sync with upstream before committing
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
7. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
8. Push to the branch (`git push origin feature/AmazingFeature`)
9. Open a pull request

Any contributions you make are greatly appreciated. Thanks again!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Representative supervisor: Heikki Naski, FiSMA ry

Project Link: [https://github.com/fisma-benefit-app/benefit-app](https://github.com/fisma-benefit-app/benefit-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BANNER LINKS -->

[contributors-shield]: https://img.shields.io/github/contributors/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[contributors-url]: https://github.com/fisma-benefit-app/benefit-app/graphs/contributors
[commit-shield]: https://img.shields.io/github/last-commit/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[commit-url]: https://github.com/fisma-benefit-app/benefit-app/commits/main/
[issues-shield]: https://img.shields.io/github/issues/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[issues-url]: https://github.com/fisma-benefit-app/benefit-app/issues
[license-shield]: https://img.shields.io/github/license/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[license-url]: https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/LICENSE

<!-- BUILT WITH LINKS -->

[front-end-shield]: https://img.shields.io/badge/FrontEnd-000000?style=for-the-badge
[back-end-shield]: https://img.shields.io/badge/BackEnd-000000?style=for-the-badge
[database-shield]: https://img.shields.io/badge/Database-000000?style=for-the-badge
[tools-shield]: https://img.shields.io/badge/Tools-000000?style=for-the-badge
[docker-shield]: https://img.shields.io/badge/docker-257bd6?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
[figma-shield]: https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white
[figma-url]: https://www.figma.com/
[github-shield]: https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white&style=for-the-badge
[github-url]: https://github.com/
[github-actions-shield]: https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white
[github-actions-url]: https://github.com/features/actions
[gradle-shield]: https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=Gradle&logoColor=white
[gradle-url]: https://gradle.org/
[java-shield]: https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white
[java-url]: https://www.java.com/en/
[postgres-shield]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white
[postgres-url]: https://www.postgresql.org/
[react-shield]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[react-url]: https://react.dev/
[spring-shield]: https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white
[spring-url]: https://spring.io/
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[vs-code-shield]: https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=vsc&logoColor=white&style=for-the-badge
[vs-code-url]: https://code.visualstudio.com/
