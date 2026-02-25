# Database Guide

This guide explains how to connect to the Benefit App database in both local development and staging environments. It also explains how the database is seeded in different environments.

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

## 2. Production and Testing Databases (Heroku Postgres)

The production and testing databases are hosted on Heroku Postgres. Database seeding is controlled via Heroku.

### Production and testing database seeding

Both production (`fisma-benefit-app`) and testing (`fisma-benefit-app-testing`) apps in Heroku have config variables to control when to seed the databases and from which file:

- `DATABASE_INIT_MODE`: either `always` or `never`
  - setting the variable to `always` reseeds the database; **NOT RECOMMENDED** for production, sometimes useful for testing
  - setting the variable to `never` prevents the database from reseeding: default option for both databases
- `DATABASE_SEED_FILE`: the file from which the database reseeds
  - `database-seed-production.sql` for reseeding production database
  - `database-seed-testing.sql` for reseeding testing database
  - The main difference in different seeding files is the user credentials used to log in to different environments

Note that changing config variables in Heroku restarts the dyno.

The contents of the database can also be reseeded manually. You can run the contents of each seeding file in the database directly, resulting in reseeding. See accessing database via different methods below.

### Access via Heroku CLI

```sh
heroku login # If not logged in already
heroku pg:psql HEROKU_PRODUCTION_POSTGRES_DB_NAME --app=fisma-benefit-app # production database
heroku pg:psql HEROKU_TESTING_POSTGRES_DB_NAME --app=fisma-benefit-app-testing # testing database
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
