# Scalingo Maintenance Guide

How to deploy, check and look after the Scalingo testing environment once it exists. For setting it up from scratch, see the [Scalingo deployment guide](./scalingo_deployment.md).

Written on 2026-11-14. Checked against Scalingo CLI 1.51.1. This guide's commands are written with `Windows OS` in mind.

## Quick reference

| Thing | Value |
|---|---|
| App | `fisma-benefit-app` |
| Region | `osc-fr1` |
| Dashboard | https://dashboard.scalingo.com/apps/osc-fr1/fisma-benefit-app |
| Backend | https://fisma-benefit-app.osc-fr1.scalingo.io |
| Health check | https://fisma-benefit-app.osc-fr1.scalingo.io/actuator/health |
| Frontend | https://fisma-benefit-app-testing.github.io/benefit-app-testing/scalingo-testing/ |
| Frontend version | https://fisma-benefit-app-testing.github.io/benefit-app-testing/scalingo-testing/version.json |
| Database | PostgreSQL add-on, plan `postgresql-starter-512` |


## Deploying the backend

**Automatic deployment is currently off** (checked 2026-11-14 with). Merging to `main` does **not** update the Scalingo backend. Someone has to deploy it.

The frontend is different: [deploy-scalingo-testing-frontend.yml](../../.github/workflows/deploy-scalingo-testing-frontend.yml) publishes it on every push to `main`. So after a merge, the frontend is already new while the backend is still old, until someone deploys.

### Before deploying

1. **See what is running now:**

   ```powershell
   scalingo --app fisma-benefit-app --region osc-fr1 deployments
   ```

   The newest row's `GIT REF` is the commit the backend runs.

2. **Check for new migrations** since that commit. Replace `<deployed-ref>` with the `GIT REF` from step 1:

Run on your repository root:

   ```powershell
   git fetch origin
   git diff --name-only <deployed-ref> origin/main -- backend/src/main/resources/migrations/
   ```

   No output means no new migrations. Otherwise, see [Database migrations](#database-migrations).

3. **Back up the database** before any deployment. See [Backups](#backups).

### Deploy

**Dashboard:** app → **Deploy** tab → **Manual deploy** → branch `main` → **Trigger deployment**.

A build takes about 1–3 minutes. If the build fails, the old version keeps running.

### After deploying

1. Check that `ps` shows `web-1` as `running` with a fresh `CREATED AT` time (see [Is it healthy?](#is-it-healthy)).
2. Open the [health check URL](https://fisma-benefit-app.osc-fr1.scalingo.io/actuator/health). It should say `{"status":"UP"}`.
3. Log in on the frontend and test features (e.g opening a project, saving something, downloading pdf's...)

### Turning automatic deployment on

Only do this if the team decides it wants it. App → **Deploy** tab → **Automatic deploy** → branch `main`. With it on, migrations still have to be run by hand, so a merge that adds a migration can break login until someone runs it.

### The frontend

The frontend needs no action. To redeploy it by hand: GitHub → **Actions** → **Deploy Scalingo testing frontend** → **Run workflow**. Check `version.json` (see the quick reference): `sha` is the commit it was built from.

## Is it healthy?

```powershell
scalingo --app fisma-benefit-app --region osc-fr1 apps-info
scalingo --app fisma-benefit-app --region osc-fr1 ps
```

- `apps-info` → `Status` should be `running`.
- `ps` → `web-1` should be `running`. `CREATED AT` tells you when the container last (re)started.

Then open the [health check URL](https://fisma-benefit-app.osc-fr1.scalingo.io/actuator/health).

### Logs

```powershell
scalingo --app fisma-benefit-app --region osc-fr1 logs --follow
```

Without `--follow`, it prints the latest lines and stops. Add `--lines 500` to see further back. The dashboard's **Logs** tab shows the same.

On startup, the log ends with `Started BackendApplication`. If the app crashes, the reason is usually a few lines above `APPLICATION FAILED TO START`.

### Restart

```powershell
scalingo --app fisma-benefit-app --region osc-fr1 restart
```

This may print nothing for a while. That's normal. Check with `ps` that `CREATED AT` changed, or use the dashboard's **Restart** button.

## Environment variables

The full list and what each one is for is in [step 5 of the deployment guide](./scalingo_deployment.md#5-set-the-apps-environment-variables).

- A change takes effect only after a **restart** or deploy.
- `JWT_PRIVATE_KEY` spans several lines. Set it in the dashboard, not with `env-set`.
- `SCALINGO_POSTGRESQL_URL` and `DATABASE_URL` belong to the database add-on. Don't edit or delete them.

## Database

### Open a console

```powershell
scalingo --app fisma-benefit-app --region osc-fr1 pgsql-console
```

Useful commands inside: `\d` lists tables, `\d app_users` shows one table's columns, `\q` quits.

### Database migrations

Migrations are **manual**. Nothing runs them on deploy. They live in [backend/src/main/resources/migrations/](../../backend/src/main/resources/migrations/), named by date. When a PR adds one, it must be run on the Scalingo database too, or the new backend may fail. For example, missing role migrations made every login fail with `401 UNAUTHORIZED`.

1. Take a backup (see [Backups](#backups)).
2. Read the migration file, so you know what it changes.
3. Open the console and paste the file's SQL, oldest file first.
4. Check the result, e.g. with `\d <table>`.

To check whether a migration has already been run, look for what it creates and see if such changes have already been made to the database.

Don't run a migration twice. Don't run `schema-dev.sql` on a database that has data: its first line drops every table.

**Order:** if the new code needs the migration (for example, a new column), run it right before deploying. If the migration removes something the old code still uses, deploy first.

### Backups

```powershell
# List backups
scalingo --app fisma-benefit-app --region osc-fr1 --addon postgresql backups

# Make one now
scalingo --app fisma-benefit-app --region osc-fr1 --addon postgresql backups-create

# Download the newest one to your Downloads folder
scalingo --app fisma-benefit-app --region osc-fr1 --addon postgresql backups-download --output $HOME\Downloads\scalingo-backup.tar.gz
```

Backups contain user data. Don't commit them or leave them lying around; delete the download when you're done.

To restore, see [Scalingo's PostgreSQL backup documentation](https://doc.scalingo.com/databases/postgresql/backing-up).

## Updating the Scalingo CLI

When the CLI says `Your Scalingo client (...) is out-of-date`, update it. `scalingo update` doesn't work on Windows; it only says to reinstall.

1. Download the Windows zip from the [CLI page](https://cli.scalingo.com) (or from the [GitHub releases](https://github.com/Scalingo/cli/releases): `scalingo_<version>_windows_amd64.zip`).

2. Unzip it and replace the `scalingo.exe` (e.g in `C:\Scalingo_CLI\scalingo.exe`).
3. Check with `scalingo --version`.

If Windows says *"An Application Control policy has blocked this file"*, Smart App Control blocked the new exe, which might happen with new releases that Windows doesn't trust yet. If this happens to you, put the old version exe back to keep working (if it was removed, redownload it). The old version still works; the out-of-date message is only a warning.

If the CLI says you're not logged in, or the API token stops working, log in again as in [step 2 of the deployment guide](./scalingo_deployment.md#2-log-in-to-the-cli-with-an-api-token).

## Access

```powershell
scalingo --app fisma-benefit-app --region osc-fr1 collaborators
scalingo --app fisma-benefit-app --region osc-fr1 collaborators-add <email>
scalingo --app fisma-benefit-app --region osc-fr1 collaborators-remove <email>
```

When someone leaves the team, remove them here and have them revoke their API tokens. When the team changes, also update the testing GitHub organization, as described in the [deployment guide](./deployment_guide.md#testing-github-pages-site).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login fails with `401 UNAUTHORIZED` | A migration hasn't been run, or `JWT_PRIVATE_KEY` is wrong | Check the logs. Run the missing migrations. Check the key |
| Frontend says *Cannot reach server* | The backend is down, or CORS blocks the frontend | Check the health URL and `ps`. Check that `CORS_ALLOWED_ORIGINS` is the frontend URL.
| A new feature works on Heroku testing but not on Scalingo | The Scalingo backend hasn't been deployed since the merge | Compare `deployments` with `main`. Deploy |
| `restart` prints nothing | Normal; it's waiting on the platform | Check `ps` or the dashboard |

## Routine checks

Before a sprint review, or about once every month:

- [ ] The backend runs the latest `main` (`deployments`), and every migration has been run.
- [ ] A recent backup exists (`backups`).
- [ ] The health URL says `UP`, and login works.
- [ ] The CLI is up to date.
- [ ] Collaborators are only current team members.
- [ ] The app's stack is current: `apps-info` shows it, and the dashboard warns when it is being retired.

## See also

- [Scalingo deployment guide](./scalingo_deployment.md): first-time setup
- [Deployment guide](./deployment_guide.md#scalingo-testing-environment-alongside-heroku): how the Scalingo frontend is built and published
- [Database guide](./database.md): profiles, seeding and migrations
- [Scalingo documentation](https://doc.scalingo.com)
