# Database Guide

This guide explains how to connect to the Benefit App database in both local development and staging environments.

## 1. Local Database (Docker)

For development, Postgres runs inside Docker Compose. See compose.yaml in project root for the container name, user, password, and database.

### Access via Docker

```sh
docker exec -it benefit-app-postgres-1 psql -U <username> <database>
```

### Access via local psql

If you have PostgreSQL installed locally:

```sh
psql -h localhost -p 5433 -U <username> <database>
```

## 2. Staging Database (Heroku Postgres)

The staging database is hosted on Heroku Postgres.

### Access via Heroku CLI

```sh
heroku pg:psql postgresql-graceful-97698 --app fisma-benefit-app
```

### Access via direct psql

You can also connect using credentials from Heroku Dashboard:

```sh
psql -h <host> -p <port> -U <username> <database>
```

You’ll be prompted for the password.

### Access via DBeaver (GUI)

- 1. Install [DBeaver](dbeaver.io/download/).
- 2. Go to Database → New Connection → PostgreSQL.
- 3. Enter the values from Heroku (host, port, database, username, password).
- 4. Click Finish. The database schema and tables will appear in the left-hand panel.

## 3. Connection URL Format

Postgres JDBC URL format:

```php-template
jdbc:postgresql://<host>:<port>/<database>
```

Example:

```bash
jdbc:postgresql://ec2-00-00-00-00.compute-1.amazonaws.com:5433/fisma_db
```

## 4. Credentials

- Source of truth: All database credentials are stored in the private backend-credentials repository.
- Alternative: You can also view credentials in the Heroku dashboard.

Never commit credentials to this repository.
