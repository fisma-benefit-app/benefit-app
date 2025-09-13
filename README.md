<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Last commit][commit-shield]][commit-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!--
[![Build][build-shield]][build-url]
-->

<br />
<div align="center">
  <a href="https://www.fisma.fi/in-english/">
    <img src="https://www.fisma.fi/wp-content/uploads/2022/03/cropped-Fisma_logo.png" alt="FiSMA shield" width="200">
  </a>
  <a href="https://www.haaga-helia.fi/en">
    <img src="https://www.haaga-helia.fi/themes/custom/hh/logo.png" alt="Haaga-Helia shield" width="200">
  </a>

  <h3 align="center">Benefit application</h3>

  <p align="center">
    All in one repository for the Benefit application developed in collaboration
    <br /> between FiSMA ry and Haaga-Helia University of Applied Sciences.
    <br />
    <a href="#getting-started"><strong>Get Started »</strong></a>
  </p>
</div>

<br>
<details>
<summary><b>Table of Contents</b></summary>
  <ol>
    <li>
        <a href="#about-the-project">About the Project</a>
    </li>
    <li>
        <a href="#built-with">Built With</a>
    </li>
    <li>
        <a href="#architecture">Architecture</a>
    </li>
    <li>
        <a href="#api">API</a>
    </li>     
    <li>
        <a href="#getting-started">Getting Started</a>
    </li>
    <li>
        <a href="#usage">Usage</a>
    </li>
    <li>
        <a href="#cicd">CI/CD</a>
    </li>
    <li>
        <a href="#quality-assurance-and-security">Quality Assurance and Security</a>
    </li>
        <li>
        <a href="#roadmap">Roadmap</a>
    </li>
    <li>
        <a href="#top-contributors">Top Contributors</a>
    </li>
    <li>
        <a href="#license">License</a>
    </li>
    <li>
        <a href="#contact">Contact</a>
    </li>
  </ol>
</details><br>

<!-- ABOUT THE PROJECT -->

## About the Project

The Benefit application has been developed in collaboration with FiSMA ry and Haaga-Helia University of Applied Sciences. It's designed for function point analysis, primarily supporting Scope Managers in performing calculations, reporting, and archiving. The main functionality of the app follows standard ISO/IEC 29881.

### What is Function Point Analysis?

Function point analysis is used to measure the functional size of software. This measurement can then be applied when analyzing productivity or preparing workload estimates.

There are several function point analysis methods, but in this project, the term specifically refers to the FiSMA 1.1 method.

### FiSMA 1.1 Method Overview

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

The [northernSCOPE™](https://www.fisma.fi/wp-content/uploads/2022/01/northernscope-brochure-v152.pdf) concept is a framework developed and provided by FiSMA to support the application of function point analysis in software projects.

### Deployment

The backend has been deployed using Heroku and the frontend using GitHub Pages. More information can be found in the [documentation](/documents/).

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

<!-- ARCHITECTURE -->

## Architecture

The structure of Benefit's SQL database is shown in the diagram below:

![Database diagram.](/documents/img/images_for_manuals/database_diagram.png)

Picture #: Diagram of Benefit's database.

More information on how to access the database can found in the [documentation](/documents/database_manual.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- API -->

## API

WIP

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### 1) Prerequisites

- **Docker** installed (and running).
- Or, for local-only dev (without Dockerized backend):
  - a local **PostgreSQL** installation (or use only the dockerized database. see 3B).
  - **Java 21**
  - **Nodejs** and **npm**

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

| You can change them as you wish, but the dev environment should usually work with the default values.

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

- Frontend: http://localhost:5173/benefit-app/login (Username: **user**, Password: **user**)
- Backend: http://localhost:8080/actuator/health

#### B) Development Without Docker (local backend)

1. You only need the **frontend .env** file (`frontend/.env` with VITE_API_URL pointing to your backend).
2. If you have previously run Docker, clean backend build dirs once to avoid permission issues:
   ```bash
   sudo rm -rf backend/.gradle backend/build
   ```
3. Make sure a Postgres DB is available:
   - Run only Postgres via Docker:
     ```bash
     docker compose up db
     ```
   - Or use your own Postgres locally (check port/credentials in `backend/src/main/resources/application.yaml`).
4. Start backend:
   ```bash
   cd backend
   ./gradlew bootRun
   ```
5. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### (Optional) Quick Troubleshooting

- **No seed users** → ensure backend has `spring.sql.init.mode=always` in `application.yaml` or `SPRING_SQL_INIT_MODE=always` in Docker Compose, then reset DB once.
- **Hot reload flaky in Docker** → keep `CHOKIDAR_USEPOLLING=true`.
- npm install fails because of permissions? -> `rm -rf node_modules` inside the frontend folder

### (Optional) Notes

- Change host ports in `.env` if 5173/8080/5433 are taken.
- Use a DB GUI (e.g., DBeaver) with host `localhost`, port `5433`, db `fisma_db`, user `myuser`, pass `secret`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->

## Usage

![Benefit-app's frontend UI page, taken on May 14 2025](/documents/img/images_for_manuals/UI_project_page_14_05_2025.png)

Picture 1: A visual representation of the Benefit application's UI. [TODO: Update placeholder!]

The application is actively running on the following website:

https://fisma-benefit-app.github.io/benefit-app/#/login

The _login site_, which is linked to App user's account information
from database is working fine.

![Benefit-app's frontend login page UI, taken on May 14 2025](/documents/img/images_for_manuals/UI_login_page_14_05_2025.png)

The _new project site_ with functionalities suching creating a new project,
saving project and its version, export project into CSV and PDF, etc.
is working fine.

![Benefit-app's frontend project page UI, taken on May 14 2025](/documents/img/images_for_manuals/UI_project_page_14_05_2025.png)

Below is a demo of the Benefit-app, recorded on May 14 2025.
Demo was splitted into two parts due memory size limitation in md-files.

**Part 1**: Login to user account, new project creation, new functional points creation and different version control.

https://github.com/user-attachments/assets/1407d6b8-f1fe-47c1-9fae-3c74588a6606

**Part 2**: Project exporting to CSV & PDF, changing language from English to Finnish, deleting project
and trying login non-existing account.

https://github.com/user-attachments/assets/31b00e69-c9dc-461e-97cc-5a5dc96b96ba

If the videos are not playing or are bad quality, then you can download
both videos from documents' video directory:

**Part 1 video**: https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/documents/videos/benefit_app_demo_sd_14_05_2025_part_1.mp4

**Part 2 video**: https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/documents/videos/benefit_app_demo_sd_14_05_2025_part_2.mp4

_For more examples, please refer to the [documentation](https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/documents)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CI/CD -->

## CI/CD

a) **KISS**. From the very first sprint and on,
Fisma ry required our team to keep Benefit-app
simple as possible in every development.

This meant such as creating minimal viable product as
soon as possible, deploying the Benefit-app as cheaply as
possible (no more than 10 euros), limiting imports of
third party libraries and tools, etc.

In order Fisma ry can review every small solutions and changes
as soon as possible, we held Sprint reviews every second week
(with few exceptions due holidays).

b) Originally, we had three branches: dev, main and qa.

- **Dev** is our so called sandbox branch, where we can expirement and test new possible solution and tools.

- **Qa** is our product review branch, where we pull all _functional_ codes for Sprint Review together with product owners.

- **Main** is our official branch, where project has been deployed (finalized) and refactor all unnecessary, broken solutions and tools.

After third sprint and on, we had more branches for specific development or issues,
such as bug fixes and shieldut functionality.

Despite of having many branches, this ensured that no git conflicts,
nor code errors, wouldn't happen regularly during development process.

When it was time to pull working solutions (or codes) from other branches
to the dev or main branch via pull requests, we implemented a functionality
where every pull request must be reviewed and accepted by other team members.
This was due assuring quality of the codes and minimize possible errors.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- QUALITY ASSURANCE AND SECURITY -->

## Quality Assurance and Security

The number of imported dependencies (e.g. third party libraries) within the project is limited to minimize updating or reconfiguring needs.

**TODO** How to run on CLI?
Tests are configured in the file **backend/build.gradle**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Compatibility with mobile apps
- [ ] Multilayer architecture
- [ ] Improve error management
- [ ] Improve quality assurance
- [ ] Improve project listing
  - [ ] Implement search functionality
  - [ ] Improve edit functionality
  - [ ] Improve project sorting
- [ ] Update documentation
  - [ ] Document how Benefit handles login tokens (database to API, and vice versa) in user_authentication_guide.md
  - [ ] Document information security on JWTs and cookies

The project's requirement specification can be found [here](https://docs.google.com/document/d/1FXYXPMAwyoZNdxBxYVOIQPrcBr01fXAB4nvHD-Diy7w/edit?tab=t.0#heading=h.6dj02y3xjnh0). See the [open issues](https://github.com/fisma-benefit-app/benefit-app/issues) for a full list of proposed features and known issues.

  <p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTORS -->

## Top Contributors

<a href="https://github.com/fisma-benefit-app/benefit-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fisma-benefit-app/benefit-app" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fisma-benefit-app/benefit-app/blob/HEAD/LICENSE) for more information.

  <p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Contact: Heikki Naski

Project Link: [https://github.com/fisma-benefit-app/benefit-app](https://github.com/fisma-benefit-app/benefit-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BANNER LINKS -->

[contributors-shield]: https://img.shields.io/github/contributors/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[contributors-url]: https://github.com/fisma-benefit-app/benefit-app/graphs/contributors

<!--[build-shield]: https://img.shields.io/github/actions/workflow/status/fisma-benefit-app/benefit-app/pages-build-deployment.yml?branch=main
[build-url]: https://github.com/fisma-benefit-app/benefit-app/actions/workflows/pages/pages-build-deployment.yml
-->

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
[docker-shield]: https://img.shields.io/badge/docker-257bd6?style=for-the-badge&shield=docker&shieldColor=white
[docker-url]: https://www.docker.com/
[figma-shield]: https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&shield=figma&shieldColor=white
[figma-url]: https://www.figma.com/
[github-shield]: https://img.shields.io/badge/GitHub-%23121011.svg?shield=github&shieldColor=white&style=for-the-badge
[github-url]: https://github.com/
[github-actions-shield]: https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&shield=githubactions&shieldColor=white
[github-actions-url]: https://github.com/features/actions
[gradle-shield]: https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&shield=Gradle&shieldColor=white
[gradle-url]: https://gradle.org/
[java-shield]: https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&shield=openjdk&shieldColor=white
[java-url]: https://www.java.com/en/
[postgres-shield]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&shield=postgresql&shieldColor=white
[postgres-url]: https://www.postgresql.org/
[react-shield]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&shield=react&shieldColor=%2361DAFB
[react-url]: https://react.dev/
[spring-shield]: https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&shield=springboot&shieldColor=white
[spring-url]: https://spring.io/
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&shield=typescript&shieldColor=white
[typescript-url]: https://www.typescriptlang.org/
[vs-code-shield]: https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?shield=vsc&shieldColor=white&style=for-the-badge
[vs-code-url]: https://code.visualstudio.com/
