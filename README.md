# Benefit app main repository.
All-in-one repository for the Benefit application. Includes such as frontend, backend, documents, etc.

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


**What is Benefit application and what is it's main purpose?**

Benefit application, i.e. **_benefit-app_** is a software size mesurement program, 
that will calculate function points of navigation and query, 
interfaces to/from other, inputs and outputs, etc.

FiSMA ry requested a working version of benefit-app from Haaga-Helia University 
of Applied Sciences on Spring 2025. The working group were third year's Haaga-Helia's students,
specialized on software development.


![fisma_frontend_home_page_14_02_2024](https://github.com/user-attachments/assets/50d90e91-6d70-4b11-b9be-ac36b82894ea)

Picture 1: A visual re-presentation of the Benefit application's UI. [Placeholder, must be updated]


**Whom is application is made for?**
The application was made first and foremost staff of FiSMA ry.

The application can be useful for experts, who want to easily calculate
function points of other applications.

**What are prerequisites?**
We have a working live-version of Benefit-app for FiSMA ry's staff.

For those who want locally activate Benefit-app,
we have broadly explained all steps and prerequisites in our documents folder,
especially 

In short, we expect from local user to have background on Java with Gradle,
React, command language interfaces and Docker.


**Why only one repository for the project?**

Our team decided to have only one repository for the project on 24th January 2025.

Majority of the team justified the decision, as it is much easier
to find essential files and data from one and only repository.
Having two or more repository makes the finding of files very troublesome,
and in some case can even cause merging problems in Github.

---

## 2. Algorithm

The mathematical algorithm has the following logic...

---

## 3. Tools

We have used following tools in the project, alphabetically:
  
* Figma for preliminary sketching UI design. 

* Java with Gradle for backend.

* Docker, due it will automatically install required languages and libraries 
(e.g. PostgreSQL) for the new member. Thus it will save both time and hussle for future groups.  

* PostgreSQL for the database. Everyone of our team has used SQL for databases. 
Thus production will be most effective, when we are working with familiar language.
We also used PostgreSQL over other SQL DBMS due product owner's wishes. 

* Spring boot for backend.

* Typescript for frontend.

* Visual Studio Code (version 1.96.4 and newer) as our team's main IDE for coding. 


---

## 4. Frontend

In short, frontend works following...

Please read [add a frontend manual] from documents' directory for more information.

---

## 5. Backend

In short, backend works following...

Please read [add a backend manual] from documents' directory for more information.

---

## 6. Database

The structure of Benefit's SQL database is shown in the below diagram:


![FiSMA db diagram](https://github.com/user-attachments/assets/0a503ab0-fe85-4d01-af8b-601663ff2205)

Picture #: Diagram of Benefit's database.


---

## 7. CD/CI

The CD/CI pipeline is following:

a) MVP and KISS. In the first sprints (i.e. from Sprint 01 to ...),
our product owner required our team to keep Benefit application simple as possible
in every development.

Thus we developed a very basic calculator (MVP), that only calulates one row of elements.

b) We have three branches: dev, main and qa.
  **Dev** is our so called sandbox branch, where we can expirement and test new possible solution and tools.
  **Qa** is our product review branch, where we pull all _functional_ codes for Sprint Review together with product owners.
  **Main** is our official branch, where project has been deployed (finaliszed) and refactor all unnecessary, broken solutions and tools.

---

## 8. Quality assurance

The assured quality of application by ... testing? end-users? ...

---

## 9. Results

The application is working fine/lagging/ok and why...

---

## 10. Known bugs and technical issues

So far, we have discovered following bugs...

---

## 11. Future improvements

We have come following improvements and future features for the application...
