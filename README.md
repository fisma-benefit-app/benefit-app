# Benefit app main repository.
All-in-one repository for the Benefit application. Includes frontend, backend, documents, etc.

**Product owner**: FiSMA ry 2025.

<img src="https://www.fisma.fi/wp-content/uploads/2022/03/cropped-Fisma_logo.png" width="200">

**Representative supervisor**: Heikki Naski.



**Collaborators**: Haaga-Helia University of Applied Sciences, 2025.

<img src="https://www.haaga-helia.fi/themes/custom/hh/logo.png" width="200">


---

## Table of contents

1. Introduction
2. Algorithm
3. Tools
4. Frontend
5. Backend
6. Database
7. CI/CD
8. Quality Assurance
9. Results
10. Known bugs
11. Future improvements

---

## 1. Introduction


**What is Benefit application and its main purpose?**

Benefit application is a project by FiSMA ry 2025. It is a software tool designed for estimating the size of a software project, which calculates function points for navigation and queries, external interfaces, inputs and outputs. Based on these, it helps estimate the project's budget and costs."

![fisma_frontend_project_page_29_03_2025](https://github.com/user-attachments/assets/becefb55-5342-4afb-ac4c-2885cea017a8)

Picture 1: A visual representation of the Benefit application's UI. [TODO: Update placeholder!]


**Whom is application is made for?**

The application is designed for businesses and individuals who want to estimate the size and costs of a software project.


**What are prerequisites?**

Add explaniation ...


"Why are the frontend, backend, and other components stored in a single repository?"

The frontend, backend, and other components are stored in a single repository to streamline the development process, allowing the team to work efficiently and coordinate changes more easily.

---

## 2. Algorithm

The mathematical algorithm has the following logic...

---

## 3. Tools

We have used following tools in the project, alphabetically:

* 
* 

* Figma for preliminary sketching UI design. 

* Java with Gradle for backend.

* Docker, due it will automatically install required languages and libraries 
(e.g. PostgreSQL) for the new member.

Thus it will save both time and hussle for future groups.  

* PostgreSQL for the database. Everyone of our team has used SQL for databases. 
Thus production will be most effective, when we are working with familiar language.

We used PostgreSQL over other SQL DBMS as product owner's wishes. 

* Typescript for frontend.
* 
* Spring boot for backend.

* Visual Studio Code (version 1.96.4 and newer) as our team's main IDE for coding. 



---

## 4. Frontend

Please read [add a frontend manual] from documents -directory for more information.

---

## 5. Backend

Please read [add a backend manual] from documents -directory for more information.

---

## 6. Database

The structure of Benefit's SQL database is shown in the diagram below:

![database-img](https://github.com/user-attachments/assets/5a40b948-4ea3-45f4-bc1c-3f5d3a54e2c3)

Picture #: Diagram of Benefit's database.

---

## 7. CD/CI

a) MVP and KISS. In the first sprints (i.e. from Sprint 01 to ...),
our product owner required our team to keep Benefit application simple as possible
in every development.

b) We have three branches: dev, main and qa.
  **Dev** is our so called sandbox branch, where we can expirement and test new possible solution and tools.
  **Qa** is our product review branch, where we pull all _functional_ codes for Sprint Review together with product owners.
  **Main** is our official branch, where project has been deployed (finaliszed) and refactor all unnecessary, broken solutions and tools.

---

## 8. Quality assurance

Quality of application was assured by TODO: testing/end-users

---

## 9. Results

TODO: The application is working fine/lagging/ok and why...

---

## 10. Known bugs and technical issues

So far, we have discovered following bugs...

---

## 11. Future improvements

Here are planned improvements and future features for the application...
