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

## 2. Production and Testing Databases (Scalingo PostgreSQL)

Production and testing use separate Scalingo PostgreSQL databases. The shared backend configuration sets SQL initialization to `never`. Use manual migrations for hosted databases.

Database migrations are manual. See (/backend/src/main/resources/migrations/). On a self-hosted server (`docker-compose.prod.yaml`), `./update_server.sh` applies them and records them in the `schema_migrations` table; see the [UpCloud guide](./upcloud_deployment.md#updating-to-a-newer-version).

### Project family IDs

Stop the old backend before applying `2026_11_15_projects_family_id.sql`, then start the updated backend. On a self-hosted deployment, run `docker compose -f docker-compose.prod.yaml stop backend` before `./update_server.sh`. An archive request handled by the old backend after the backfill would give the new version a separate family ID.

The migration links legacy rows when their stored creation and version timestamps support a single, consecutive same-name history. Ambiguous rows, including archives created within the timestamp resolution of the original project, get separate family IDs. Review any split history against trusted records before correcting family IDs, since a family ID controls how later membership changes propagate. The migration leaves existing membership rows as recorded.

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

### Access via Scalingo CLI

Use an authenticated [Scalingo CLI](https://doc.scalingo.com/tools/cli/introduction). Choose the command for the database you intend to access.

```sh
scalingo --app benefit-testing --region osc-fr1 pgsql-console # testing
scalingo --app benefit --region osc-fr1 pgsql-console # production
```

See the [Scalingo maintenance guide](scalingo_maintenance.md#backups) for backups. Use the corresponding app name for the database you intend to back up.

### Access via direct psql

You can also connect using the affected Scalingo app’s [database connection details](scalingo_deployment.md#4-find-the-database-connection-details):

```sh
psql -h <host> -p <port> -U <username> <database>
```

You’ll be prompted for the password.

### Access via DBeaver (GUI)

- 1. Install [DBeaver](https://dbeaver.io/download/).
- 2. Go to Database → New Connection → PostgreSQL.
- 3. Enter the connection details from the affected Scalingo app (host, port, database, username, password).
- 4. Click Finish. The database schema and tables will appear in the left-hand panel.

### Update database manually

If you need to update the database manually (i.e. change password or add new user), follow these steps:

1. Access the database via your preferred method (Scalingo CLI, psql, DBeaver, or pgAdmin).
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

- Use the affected Scalingo app’s **Environment** tab for current database credentials.

Never commit credentials to this repository.

For remote database connections, verify the provider's TLS configuration and
certificate validation requirements. A bare JDBC URL does not demonstrate
encrypted, authenticated transport; configure and verify a suitable mode such as
`sslmode=verify-full` with the correct trusted CA and hostname, following the
[PostgreSQL JDBC TLS documentation](https://jdbc.postgresql.org/documentation/ssl/).
Do not weaken validation merely to make a connection succeed. Actual hosted
JDBC/TLS settings were not verified by the November local audit.
