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

Database migrations are manual. See (/backend/src/main/resources/migrations/). 

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


The contents of the database can also be reseeded manually. You can run the contents of each seeding file in the database directly, resulting in reseeding. See accessing database via different methods below.

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

- 1. Install [DBeaver](dbeaver.io/download/).
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
SET password = '$2a$12$csFVT0JamCwPg18duSENPu.6HxtqeDNfXLI3mPXb2tRClCR/VjduK'
WHERE username = 'user';
```

If you update passwords like this, **ALWAYS** run passwords through an encryptor like this: https://bcrypt-generator.com/.

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
