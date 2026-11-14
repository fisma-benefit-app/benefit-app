# Database Guide

This guide explains how to connect to the Benefit App database in both local development and staging environments. It also explains how the database is seeded in different environments.

The base backend configuration intentionally disables SQL initialization in the shared configuration file (`application.yaml`). Database seeding and initialization are therefore controlled in the dev-profile specific `application-dev.yaml`. 

In production environment, seeding and schema files should NEVER be used. Schema migrations are done manually for now - this also applied to the testing environment.

The current convention is:

- `application.yaml`: production-safe default, with `spring.sql.init.mode: never` and no automatic schema/data loading. Do not change this.
- `application-dev.yaml`: development-only override, with `mode: always` and `schema-dev.sql` + `database-seed-dev.sql`.
- The dev branch uses `schema-dev.sql` file so Spring does not silently discover a generic `schema.sql`. This is intentional.

## 1. Local Database (Docker)

For development, Postgres runs inside Docker Compose. See compose.yaml in project root for the container name, user, password, and database.

### Access via Docker

```sh
docker exec -it fisma_db psql -U <username> <database>
```

### Access via local psql

If you have PostgreSQL installed locally:

```sh
psql -h localhost -p 5433 -U <username> <database>
```

## 2. Production and Testing Databases (Heroku Postgres)

The production and testing databases are hosted on Heroku Postgres. Database seeding is controlled through environment configuration, and the branch-specific safety convention is that the default shared backend file must not carry a seed- or schema-init mode set to `always`.

Database migrations are manual. See (/backend/src/main/resources/migrations/). On a self-hosted server (`docker-compose.prod.yaml`), `./update_server.sh` applies them and records them in the `schema_migrations` table; see the [UpCloud guide](./upcloud_deployment.md#updating-to-a-newer-version).

### Production and testing database seeding

The repository branch currently keeps the production-safe default in the shared config:

```yaml
spring:
  sql:
    init:
      mode: never
```

The development-only profile file overrides that behavior for the Docker workflow:

```yaml
spring:
  sql:
    init:
      mode: always
      schema-locations: classpath:schema-dev.sql
      data-locations: classpath:database-seed-dev.sql
```

This branch intentionally removes the generic fallback `schema.sql` discovery path and uses the explicit `schema-dev.sql` name. That is a security and consistency improvement: Spring will not automatically look for a base `schema.sql` file when the dev override file declares the scheme and seed sources explicitly.

The production and testing environments should therefore not point at the dev seed file for normal use. Their safe default remains the shared `mode: never` configuration, and any dev-only initialization should happen only when the `dev` profile is active locally or through the Compose environment.

As a safety net, `DevProfileDatabaseGuard` stops the backend from starting when the `dev` profile is active and `spring.datasource.url` points anywhere other than a local database (`localhost`, `127.0.0.1`, `::1` or the Compose service `db`). This protects the testing and production databases if their URL ends up in `.env` by mistake. To run a local backend against a remote database on purpose, use another profile, e.g. plain `./gradlew bootRun`, which uses the default profile. The guard can't protect a database on the same machine, such as a Postgres container on a server; there, only the absence of the `dev` profile does.


Run schema/seed initialization only against a verified disposable local database.
Never replay `schema-dev.sql` or `database-seed-dev.sql` against an existing shared
testing or production database; use reviewed migrations there. For security
assessments, follow the isolated setup in [security_audit.md](security_audit.md).

### Adding the kitchen sink test project to the testing database

[`documents/test-data/kitchen_sink_project.sql`](../test-data/kitchen_sink_project.sql) inserts the "[Kitchen sink] Every component type + MLA" project from the dev seed into a database that is not seeded. Unlike the seed files it deletes nothing, takes new ids from the sequences and links the project to one existing user. See the comments at the top of the script for usage.

### Access via Heroku CLI

```sh
heroku login # If not logged in already
heroku pg:psql HEROKU_PRODUCTION_POSTGRES_DB_NAME --app=fisma-benefit-app # production database
heroku pg:psql HEROKU_TESTING_POSTGRES_DB_NAME --app=fisma-benefit-app-testing # testing database
heroku pg:backups:capture --app=fisma-benefit-app
# Ctrl + D to exit
```

See Heroku's dashboard or `backend-credentials` repository for Heroku PostgreSQL database names.

### Access via direct psql

You can also connect using credentials from Heroku Dashboard:

```sh
psql -h <host> -p <port> -U <username> <database>
```

You’ll be prompted for the password.

### Access via DBeaver (GUI)

- 1. Install [DBeaver](https://dbeaver.io/download/).
- 2. Go to Database → New Connection → PostgreSQL.
- 3. Enter the values from Heroku (host, port, database, username, password).
- 4. Click Finish. The database schema and tables will appear in the left-hand panel.

### Update database manually

If you need to update the database manually (i.e. change password or add new user), follow these steps:

1. Access the database via your preferred method (Heroku CLI, psql, DBeaver, or pgAdmin).
2. Run this SQL statement

```sql
UPDATE [table name]
SET [column name] = [value]
WHERE [column name] = [value];
```

For example to update a user called `user`'s password:

```sql
UPDATE app_users
SET password = '$2a$12$csFVT0JamCwPg18duSENPu.6HxtqeDNfXLI3mPXb2tRClCR/VjduK',
    session_version = session_version + 1
WHERE username = 'user';
```

Generate BCrypt hashes locally using trusted project tooling (the backend uses
Spring's `BCryptPasswordEncoder`); never submit real passwords to an online hash
generator. For ordinary account changes use the authenticated password-change
flow. A manual SQL password update bypasses service validation; increment
`session_version` in the same statement as shown above so existing JWT sessions
are invalidated too (requires the session-version migration). See the
[authentication guide](authentication.md#password-changes-and-every-session-invalidation)
for deployment and rollback constraints.

**NEVER EVER** store plain text passwords in the database.

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

- Source of truth: All database credentials are stored in the private `backend-credentials` repository.
- Alternative: You can also view credentials in the Heroku dashboard.

Never commit credentials to this repository.

For remote database connections, verify the provider's TLS configuration and
certificate validation requirements. A bare JDBC URL does not demonstrate
encrypted, authenticated transport; configure and verify a suitable mode such as
`sslmode=verify-full` with the correct trusted CA and hostname, following the
[PostgreSQL JDBC TLS documentation](https://jdbc.postgresql.org/documentation/ssl/).
Do not weaken validation merely to make a connection succeed. Actual hosted
JDBC/TLS settings were not verified by the November local audit.
