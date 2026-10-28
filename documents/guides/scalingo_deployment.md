# Scalingo Deployment Guide

This is how the backend and its PostgreSQL database were set up on [Scalingo](https://scalingo.com), written on 2026-10-26.

This guide explains each step for how to deploy your app to Scalingo, and the [lessons](#what-went-wrong-on-the-way) at the end explain the problems we hit along the way.

## What you end up with

```
browser ──► https://fisma-benefit-app.osc-fr1.scalingo.io  (Scalingo app, Java buildpack)
                └──► PostgreSQL add-on  benefit-demo-1234.postgresql.c.osc-fr1.scalingo-dbs.com:12345
```

> **Fictional database details:** the database username, name, host, and port shown below are invented examples, not the details of a real deployment. Get your actual values from the app's `SCALINGO_POSTGRESQL_URL`; do not copy these example values into your configuration.

| Thing | Value |
|---|---|
| App name | `fisma-benefit-app` |
| Region | `osc-fr1` |
| Dashboard | https://dashboard.scalingo.com/apps/osc-fr1/fisma-benefit-app |
| Example database user | `benefit_demo_1234` (also the example database name) |
| Example database host | `benefit-demo-1234.postgresql.c.osc-fr1.scalingo-dbs.com` |
| Example database port | `12345` |


## Before you start

**You need the following before starting:**

- **A Scalingo account.** You may use an email and password, but some of our accounts were created with "Sign in with GitHub". That matters for the CLI login (see step 2). Both ways are valid.

- **`JWT_PRIVATE_KEY`**: this environment's own private key variable. Don't reuse another environment's key, or that environment's tokens are accepted here too. To make a new one (use Git Bash): `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`. Keep this key safe: it will be set as an environment variable (see step 5).


## 1. Install the Scalingo CLI (Windows)

Download the Windows zip from the [CLI page](https://cli.scalingo.com), unzip it, and put `scalingo.exe` directly in a folder, e.g `C:\Scalingo_CLI`.

Now add the folder to your Windows environment variable `Path`.

**PowerShell way (permanent, for your user):**

```powershell
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Scalingo_CLI", "User")
```

Close and reopen PowerShell, then check:

```powershell
scalingo --version
```

> The Scalingo docs show `export PATH=$PATH:...`. That's **bash** syntax for Linux/macOS and fails in PowerShell with `Variable reference is not valid`.

## 2. Log in to the CLI with an API token

If your account was created using email and password (not through Github), you may login with the following command:

```powershell
scalingo login
```

If your account was created through GitHub (has no Scalingo password), you must use an API token instead.

**Create the token in the dashboard:**

1. Log in to the [dashboard](https://dashboard.scalingo.com) with GitHub as usual.
2. Open your account settings (top right) → **API tokens** → create a new token.
3. Copy it right away. It's shown only once.

**Log in once:**

```powershell
scalingo login --api-token <your-api-token>
```

You should see `Hello <your-username>, nice to see you!`. The CLI should now remember the login.

The token gives full access to your account. Treat it like a password, and revoke it under **API tokens** if it ever leaks.


## 3. Create the app and the PostgreSQL add-on

Skip this if `fisma-benefit-app` and its database already exist.

**Dashboard:**

1. **Create an app** → name `fisma-benefit-app`, region `osc-fr1`.
2. Open the app → **Resources** tab (called **Addons** in some versions) → **Add an addon** → **PostgreSQL** → pick a plan.

The add-on must belong to **the same app as the backend**. Then Scalingo sets two variables on that app automatically: `SCALINGO_POSTGRESQL_URL` and `DATABASE_URL`, which holds the same value. Our backend uses neither directly (it reads the `SPRING_DATASOURCE_*` variables from step 5), but leave both in place: the add-on manages them and Scalingo's CLI tools such as `db-tunnel` use them.

## 4. Find the database connection details

Everything is in one connection URL, stored in the app's `SCALINGO_POSTGRESQL_URL` variable.

**Dashboard:** open the **app** (not the database) → **Environment** tab → `SCALINGO_POSTGRESQL_URL`.

> The **database's own dashboard** also shows a connection string, but with the literal text `<password>` instead of the real password. That's deliberate. Get the real one from the app's Environment tab.

The URL looks like this:

```
postgres://benefit_demo_1234:<password>@benefit-demo-1234.postgresql.c.osc-fr1.scalingo-dbs.com:12345/benefit_demo_1234?sslmode=prefer
```

How to read it:

| Part | Meaning | Our value |
|---|---|---|
| between `postgres://` and `:` | username | `benefit_demo_1234` |
| between `:` and `@` | password | `<password>` (secret) |
| between `@` and the next `:` | host | `benefit-demo-1234.postgresql.c.osc-fr1.scalingo-dbs.com` |
| after the host's `:` | port | `12345` |
| after the `/` | database name | `benefit_demo_1234` |

To reset the password or add users: app → **Resources** → click the PostgreSQL add-on → **Users**. If you reset it, `SCALINGO_POSTGRESQL_URL` and `DATABASE_URL` update automatically, but `SPRING_DATASOURCE_PASSWORD` doesn't: update it by hand (step 5). The same goes for `SPRING_DATASOURCE_URL` if the database host or port ever changes.

## 5. Set the app's environment variables

Spring Boot can't use the `postgres://user:password@...` URL directly: JDBC needs a `jdbc:postgresql://` URL with the username and password as separate settings. Spring reads these from environment variables automatically, and they override `application.yaml`, so no code changes are needed.

Add these environment variables if they don't exist (using real values, do not copy & paste these):

| Name | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://benefit-demo-1234.postgresql.c.osc-fr1.scalingo-dbs.com:12345/benefit_demo_1234?sslmode=prefer` |
| `SPRING_DATASOURCE_USERNAME` | `benefit_demo_1234` |
| `SPRING_DATASOURCE_PASSWORD` | the password from step 4 |
| `JWT_PRIVATE_KEY` | this environment's key. If you haven't generated a private key yet, run this on Git Bash: `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048` |
| `PROJECT_DIR` | `backend` |
| `API_DEBUG` | `always` (WARNING: only use this envar if the deployment is for testing) |
| `API_DEBUG_LEVEL` | `debug` (WARNING: only use this envar if the deployment is for testing) |
| `CORS_ALLOWED_ORIGINS` | Optional: set it only if the frontend is served from another address: comma-separated `scheme://host[:port]`, no path |


**Dashboard:**

1. Open the app → **Environment** tab.
2. Add each variable: name on the left, value on the right. **Don't add quotes** around the values here.
3. Save.

**`JWT_PRIVATE_KEY`** spans several lines. Paste the whole block, from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----`, without the surrounding double quotes. If login later fails or the backend complains about the key at startup, check this value first.

Variable changes take effect only after a restart or deploy (step 8).

## 6. Log in with the default database user

On Powershell, run:

```powershell
scalingo --app fisma-benefit-app pgsql-console
```

It should automatically log you in. However, if a password is required, please see step 4 for help where to find the password in the environment variable `SCALINGO_POSTGRESQL_URL`.

### 6a. Load the schema

`backend/src/main/resources/schema-dev.sql` is the complete current schema.

> **Skip the `DROP TABLE` line at the top of the file.** It deletes all tables and their data. On a new, empty database it does nothing useful, and on an existing one it wipes everything.

Run the schema queries in the database console. Do not also run the files in `migrations/`, as the migrations are already included in the `schema-dev.sql`.

You can check existing tables using this command:

```powershell
\d
```

### 6b. Populate the database (for testing) OR create the first user/migrate previous production database (for production)

Log into the database, if you already haven't:

```powershell
scalingo --app fisma-benefit-app pgsql-console
```

**Your approach here depends on whether the deployment is for a testing or a production environment: please read the next steps carefully.**

**For a testing environment:**
To populate a testing environment's empty database with data, you may use the queries from `backend/src/main/resources/database-seed-dev.sql`. **Do not** run these queries again; in the future, do migrations manually.

**For a production environment**
In the case of a production deployment, you may not wish to populate the database with test data. 

If Scalingo will become the long-term solution for a production deployment, you may wish to migrate the existing service's (i.e Heroku's) database to the new Scalingo's database. There are **no steps in this guide** for that.

If the existing production database will not be migrated yet, create a first user for the database.

The backend expects bcrypt password hashes (`$2a$10$…`). Postgres's `pgcrypto` extension can create them.

Run, with your own username and password:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO app_users (username, password, deleted_at) VALUES ('<username>', crypt('<password>', gen_salt('bf', 10)), NULL);
DROP EXTENSION pgcrypto;
SELECT id, username FROM app_users;
```

Repeat the `INSERT` for more users. If `CREATE EXTENSION` is refused, generate a bcrypt hash elsewhere and insert it directly.

## 7. Deploy the code

**Dashboard (GitHub integration):**

1. App → **Deploy** tab → link the `fisma-benefit-app/benefit-app` GitHub repository.
2. Choose the branch (`main`).
3. Click **Manual deploy**, or enable automatic deploys for that branch.

The build log appears under the app's **Deploy** tab.

## 8. Restart and check it works

**Dashboard:**

1. App → overview page or **Resources** tab → **Restart**. (If the app has never been deployed, there's nothing to restart; step 7 picks up the variables.)
2. App → **Logs** tab.

To see whether backend is running, check the health endpoint from your own machine:

https://fisma-benefit-app.osc-fr1.scalingo.io/actuator/health

You should see `{"status":"UP"}`. Then open the frontend (for the testing environment: https://fisma-benefit-app.github.io/benefit-app/scalingo-testing/, see [the deployment guide](./deployment_guide.md#scalingo-testing-environment-alongside-heroku) for how it is built and deployed), log in with the user from step 6b, create a project, reload, and check it's still there.

## Security clean-up

Do this whenever a secret has been pasted somewhere it shouldn't be, and once after the first setup:

1. **Revoke API tokens:** account settings → **API tokens** → revoke, create a new one, `scalingo login --api-token <new-token>`.
2. **Reset the database password:** app → **Resources** → PostgreSQL add-on → **Users** → reset. Then update `SPRING_DATASOURCE_PASSWORD` and restart.
3. **Never commit** connection strings, tokens or keys. Keep them in Scalingo's Environment tab.

## 9. Link frontend to the backend

The frontend is hosted on GitHub Pages serves it at
`https://fisma-benefit-app.github.io/benefit-app/scalingo-testing/`.

The GitHub Actions workflow builds the frontend with `VITE_API_URL` set to the
Scalingo backend URL. Vite embeds this value in the build, so the browser uses the
Scalingo API rather than the Heroku API. To configure it:

1. In the GitHub repository, add the Actions secret `SCALINGO_TESTING_URL` with
   the backend URL, such as `https://<app>.osc-fr1.scalingo.io`. Do not include
   a trailing slash. This is the backend's public URL, not the database URL.
2. Ensure the Scalingo app is connected to this repository and configured to
   deploy `main` (step 7). Scalingo deploys the backend; it does not deploy the
   frontend.
3. The workflow [deploy-scalingo-testing-frontend.yml](../../.github/workflows/deploy-scalingo-testing-frontend.yml)
   builds and publishes the frontend on every push to `main`. It can also be
   started manually from the GitHub Actions tab. The frontend build and publish
   commands are `build:testing` and `deploy:scalingo-testing` in
   [frontend/package.json](../../frontend/package.json).

The Scalingo frontend is published to the `scalingo-testing` subdirectory of the
shared GitHub Pages site. Production deployments also publish to that site and
can replace the testing frontend, so [run-deployments.yml](../../.github/workflows/run-deployments.yml) publishes the Scalingo frontend again at the end of the production deployment.

## What went wrong on the way

Each entry says how to recognise the problem.

- **Linux commands in PowerShell.** `export PATH=$PATH:\C:\Scalingo_CLI/` failed with `Variable reference is not valid. ':' was not followed by a valid variable name character`. That's bash syntax. Fix: step 1's PowerShell command or the Windows environment-variable dialog.
- **CLI login with the GitHub password.** `Fail to login (1/3): fail to create API token: create token with login: unauthorized`. A GitHub-created account has no Scalingo password. Fix: log in with an API token (step 2).
- **Placeholders taken literally.** The example commands contained `HOST`, `PORT`, `DBNAME`, `YOUR_PASSWORD` and `my-app`. All of them must be replaced with real values from step 4 and the app name `fisma-benefit-app`.
- **The connection string showed `<password>`.** The database dashboard masks the password. The real value is in the **app's** Environment tab (`SCALINGO_POSTGRESQL_URL`).
- **The JDBC URL format.** Using the `postgres://user:password@host...` URL directly in Spring doesn't work. It needs `jdbc:postgresql://host:port/db` plus separate username and password variables (step 5).
- **`scalingo restart` printed nothing.** The login had worked; the command just gave no output while waiting on the platform. The dashboard's **Restart** button and **Logs** tab are a reliable alternative.
- **No Docker on Scalingo.** Scalingo can't run our own Dockerfile or `docker-compose.prod.yaml`. It builds from source with buildpacks. The Docker Image add-on only lets you *download* the images Scalingo built, not upload your own.

## See also

- [Deployment guide](./deployment_guide.md#scalingo-testing-environment-alongside-heroku): how the Scalingo testing frontend is built and deployed (the `SCALINGO_TESTING_URL` secret and its GitHub Actions workflow)
- [Database guide](./database.md): profiles, seeding and manual migrations
- [Scalingo documentation](https://doc.scalingo.com)
