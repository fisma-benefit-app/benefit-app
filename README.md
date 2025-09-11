<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![FiSMA][fisma-shield]][fisma-url]

# Benefit app

All-in-one repository for the Benefit application. Includes frontend, backend, documents, etc.

**Product owner**: FiSMA ry, 2025.

<img src="https://www.fisma.fi/wp-content/uploads/2022/03/cropped-Fisma_logo.png" width="200">

**Representative supervisor**: Heikki Naski.

**Collaborators**: Haaga-Helia University of Applied Sciences, 2025.

<img src="https://www.haaga-helia.fi/themes/custom/hh/logo.png" width="200">

## Deployment and Development

Read [dev_quickstart.md](documents/dev_quickstart.md) for getting your development environment up and running quickly.

See sections 4. Frontend and 5. Backend for more on Deployment.

<br>
<details>
<summary><b>Table of contents</b></summary>
  <ol>
    <li>
        <a href="#introduction">Introduction</a>
    </li>
    <li>
        <a href="#core-functionality">Core functionality</a>
    </li>
    <li>
        <a href="#tools">Tools</a>
    </li>
    <li>
        <a href="#frontend">Frontend</a>
    </li>
    <li>
        <a href="#backend">Backend</a>
    </li>
    <li>
        <a href="#database">Database</a>
    </li>
    <li>
        <a href="#cicd">CI/CD</a>
    </li>
    <li>
        <a href="#testing">Testing</a>
    </li>
    <li>
        <a href="#results">Results</a>
    </li>
    <li>
        <a href="#known-bugs-and-technical-issues">Known bugs and technical issues</a>
    </li>
    <li>
        <a href="#future-improvements">Future improvements</a>
    </li>
    <li>
        <a href="#license">License</a>
    </li>
    <li>
        <a href="#contact">License</a>
    </li>
    <li>
        <a href="#acknowledgements">License</a>
    </li>
  </ol>
</details><br>

## Introduction

**What is Benefit application and its main purpose?**

Benefit application is a project by FiSMA ry, developed during Spring 2025.
It is a software tool designed for estimating the size of a software project,
which calculates function points for navigation and queries, external interfaces,
inputs and outputs. Based on these, it helps estimate the project's budget and costs.

![Benefit-app's frontend UI page, taken on May 14 2025](/documents/img/images_for_manuals/UI_project_page_14_05_2025.png)

Picture 1: A visual representation of the Benefit application's UI. [TODO: Update placeholder!]

**Whom is application made for?**

The application is designed for businesses and individuals who want to estimate the size and costs of a software project.

The application can be useful for experts, who want to easily calculate
function points of other applications.

**What are prerequisites?**

User should have at least basic knowledge on software size measurements
and function points calculations. Fisma ry have great manuals for these.

Then we expect user have great knowledge on advanced developers' tools,
such as Java with Gradle for backend, Typescript for frontend, PostgreSQL for database,
Heroku environment for backend's deployment, etc. We have documented all essential
tools and their implementation in the software in the

**Why are the frontend, backend, and other components stored in a single repository?**

The frontend, backend, and other components are stored in a single repository
in order streamline the development process, allowing the team to work efficiently
and coordinate changes more easily. Due Fisma ry request, the repository was opened publicly
as open source.

The only exception is the backend-credentials repository, which is seperated from
the single repository and is private. It contains sensitive credentials for deploying
backend to Heroku.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Core functionality

The main functionality of the Benefit-app is executed in _calculations.ts_ file,
which located in frontend libraries directory (i.e. './frontend/src/lib/calculations.ts')

The calculation method follows standard ISO/IEC 29881.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tools

We have used following tools in the project, alphabetically:

- Figma for preliminary sketching UI design.

- Java with Gradle for backend.

- Docker, due it will automatically install required languages and libraries
  (e.g. PostgreSQL) for the new member. Thus it will save both time and hussle for future groups.

- PostgreSQL for the database. Everyone of our team has used SQL for databases.
  Thus production will be most effective, when we are working with familiar language.
  We also used PostgreSQL over other SQL DBMS due product owner's wishes.

- Spring boot for backend.

- Typescript for frontend.

- Visual Studio Code (version 1.96.4 and newer) as our team's main IDE for coding.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Frontend

The frontend was developed in Typescript. Due Fisma ry's
request, we have tried to limit of importing dependencies
(e.g. third party libraries) as many as possible.

This was due minimize the need of updating or reconfiguring
dependencies.

Please read frontend_manual.md from documents -directory for more information.

Link: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/install_frontend.md

For deployment of frontend, we used gh-pages method by Github, which
you can read in more detail from frontend_gh_pages_deployment.md -manual.

Link: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/frontend_gh_pages_deployment.md

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend

The backend was developed in Java with Gradle.

### Install

For installing backend locally, please read install_backend_locally_manual.md
from documents -directory for more information.

Link: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/install_backend_locally.md

### Deployment

For deployment of backend, we used Heroku platform, which
you can read in more detail from backend_heroku_deployment.md -manual.

Link: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/backend_heroku_deployment.md

### Automatic tests

**TODO** How to run on CLI?
Tests are configured in the file **backend/build.gradle**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Database

The structure of Benefit's SQL database is shown in the diagram below:

![Database diagram.](/documents/img/images_for_manuals/database_diagram.png)

Picture #: Diagram of Benefit's database.

Please read database_manual.md document from documents -directory
for more information

Link: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/database_manual.md

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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
such as bug fixes and logout functionality.

Despite of having many branches, this ensured that no git conflicts,
nor code errors, wouldn't happen regularly during development process.

When it was time to pull working solutions (or codes) from other branches
to the dev or main branch via pull requests, we implemented a functionality
where every pull request must be reviewed and accepted by other team members.
This was due assuring quality of the codes and minimize possible errors.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Testing

While we didn't had an industry standard testing of the Benefit-app during development,
we held two seminars with students from Haaga-Helia University of Applied Sciences.
These student gave essential feedbacks when reviewing our Benefit-app, which
you can read in detail in following documents:

- testing_report_from_April_02_2025.md ( https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/testing_report_from_April_02_2025.md )

- testing_report_from_April_03_2025.md ( https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/testing_report_from_April_03_2025.md )

Note these aren't considered as official systematical testing reports for Benefit-app.
This was pointed by Fisma ry during one sprint review.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Results

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

**Part 1 video**: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/videos/benefit_app_demo_sd_14_05_2025_part_1.mp4

**Part 2 video**: https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/videos/benefit_app_demo_sd_14_05_2025_part_2.mp4

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Known bugs and technical issues

Please read "Known issues" -document from Documents' directory
for list of known bugs and other unresolved technical difficulties:

https://github.com/fisma-benefit-app/benefit-app/blob/main/documents/known_issues.md

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Future improvements

Here are planned improvements and future features for the application:

- Benefit-app is not applied for mobile devices.

- Multilayer architecture functionality was not implemented to Benefit-app.
  See issue #111: "94. Monikerrosarkkitehtuuri-valinta toiminnolle.".

- Error management could be improved in Benefit-app.

- Benefit-app lacks quality check. It requires refactoring.

- Projects' listing could be improved in Benefit-app, such as
  search functionality for projects, improved edit functionality
  for projects and sorting of projects.

- Some documents require updates and further explaination. For example,
  the user_authentication_guide.md needs a description on how Benefit-app
  handles login tokens from which database to which API endpoint, and vice versa.

- Some functionalities requires documentations, for example data security on JVT tokens
  and cookies. See issue #157: "112. Tietoturvallisuudesta dokumentointi.".

  <p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the [MIT License](https://opensource.org/license/mit). See LICENSE.txt for more information.

  <p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

WIP

Contact: Heikki Naski

Project Link: [https://github.com/fisma-benefit-app/benefit-app](https://github.com/fisma-benefit-app/benefit-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

WIP

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[contributors-url]: https://github.com/fisma-benefit-app/benefit-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[forks-url]: https://github.com/fisma-benefit-app/benefit-app/network/members
[stars-shield]: https://img.shields.io/github/stars/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[stars-url]: https://github.com/fisma-benefit-app/benefit-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[issues-url]: https://github.com/fisma-benefit-app/benefit-app/issues
[license-shield]: https://img.shields.io/github/license/fisma-benefit-app/benefit-app.svg?style=for-the-badge
[license-url]: https://github.com/fisma-benefit-app/benefit-app/blob/main/LICENSE.txt
[fisma-shield]: https://img.shields.io/badge/FiSMA-FiSMA.svg?style=for-the-badge&colorB=555
[fisma-url]: https://www.fisma.fi/in-english/
