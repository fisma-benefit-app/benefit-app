# Backend local development setup instructions

This repository consists of two modules (subprojects): **backend** and **frontend**.

Project's module **backend** is a Spring Boot app that leverages Spring framework's [Docker Compose](https://docs.spring.io/spring-boot/how-to/docker-compose.html) support. It uses a PostgreSQL database, which can be run locally using Docker.

#### Prerequisites
- Ensure that Docker is installed on your machine and that your IDE has access to it.
- Verify that you have the correct Java version 23 installed.

#### How It Works
- Spring Boot automatically starts PostgreSQL via Docker Compose when the application launches.
- The Docker Compose file is located in the root directory of the project.

