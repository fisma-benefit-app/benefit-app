# Docker Guide

This guide explains how to run the Benefit App locally using Docker. It covers backend, frontend, and database setup.

## 1. Prerequisites

**New here?** See the project [README](../../README.md/#getting-started) to get started!

- [Docker Desktop](https://docs.docker.com/desktop/) installed and running.

Check Docker version:

```sh
docker --version
```

## 2. Key Docker Files

- `docker-compose.yaml` (root) – defines services: database, backend, frontend.
- `backend/Dockerfile.dev` – builds and runs the Spring Boot backend with Gradle.
- `frontend/Dockerfile.dev` – builds and runs the Vite frontend.
- `application.yaml` (backend resources) – configures datasource.
  - Local: uses values from docker-compose.yaml
  - Heroku: uses injected environment variables

## 3. Starting the Stack

From the project root:

```sh
docker compose up
```

Logs can be viewed with:

```sh
docker compose logs -f
```

To stop:

```sh
docker compose down
```

Add `--v` to reset everything (DB, caches, volumes).

## 4. Database Access

Check running containers:

```sh
docker ps
```

Connect to Postgres inside container:

```sh
docker exec -it fisma_db psql -U $POSTGRES_USER $POSTGRES_DB
```

Values (POSTGRES_USER, POSTGRES_DB) are defined in .env.

## 5. Backend Configuration

### Local development

`application.yaml` should contain:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5433/fisma_db}
    username: ${SPRING_DATASOURCE_USERNAME:myuser}
    password: ${SPRING_DATASOURCE_PASSWORD:secret}
  sql:
    init:
      mode: always
```

### Heroku deployment

Heroku sets environment variables automatically.

`application.yaml` should contain:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  sql:
    init:
      mode: never
```

## 6. Common Commands

Rebuild containers after changes:

```sh
docker compose up --build
```

Restart only the backend:

```sh
docker compose restart backend
```

Connect to backend container shell:

```sh
docker exec -it fisma_backend bash
```

## 7. Notes

- Gradle and Postgres use named volumes (gradle-cache, pgdata) for persistence.
- Always commit Docker-related changes (compose files, Dockerfiles), but never commit secrets.
