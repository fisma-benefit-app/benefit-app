# Deployment Guide

For an outage or urgent recovery, start with [incident response](incident_response.md): identify the environment, inspect health/logs, and choose a recovery action.

Testing deploys automatically from `main` to Scalingo and GitHub Pages.

## Testing GitHub Pages site

Testing uses a separate browser origin from [production](https://fisma-benefit-app.github.io/benefit-app/). Scalingo allows the testing origin so the browser can call the testing API.

- Frontend: https://fisma-benefit-app-testing.github.io/scalingo/
- Repository: [fisma-benefit-app-testing/fisma-benefit-app-testing.github.io](https://github.com/fisma-benefit-app-testing/fisma-benefit-app-testing.github.io). GitHub Pages serves the `gh-pages` branch from its root.
- The workflow publishes the `scalingo` directory using the repository write deploy key. Its private half is the `TESTING_PAGES_DEPLOY_KEY` Actions secret in the main repository.

Keep the `<org>.github.io` repository name to preserve the root Pages URL. The workflow replaces the built files in `scalingo/` on each publish. Make frontend changes in the main source repository.

If creating or rotating a key, confirm the testing organization [allows deploy keys](https://docs.github.com/en/organizations/managing-organization-settings/restricting-deploy-keys-in-your-organization).

To rotate the key, generate an Ed25519 key pair, add the new public key under **Settings → Deploy keys** on the testing Pages repository with write access, and update `TESTING_PAGES_DEPLOY_KEY` in the main repository. Remove the old deploy key after verifying the new one. Keep the testing organization’s owners current when maintainers change.

## Scalingo testing environment

[Deploy Scalingo testing](../../.github/workflows/deploy-scalingo-testing.yml) publishes the testing frontend on pushes to `main`. Scalingo’s GitHub integration automatically deploys the backend from `main` once its GitHub checks finish.

### Scalingo setup

- App: [`benefit-testing` in `osc-fr1`](https://dashboard.scalingo.com/apps/osc-fr1/benefit-testing). API: `https://benefit-testing.osc-fr1.scalingo.io`.
- Set `PROJECT_DIR=backend` and configure the testing PostgreSQL add-on, `SPRING_DATASOURCE_*` variables, and testing `JWT_PRIVATE_KEY` as described in the [Scalingo setup guide](scalingo_deployment.md).
- Set `CORS_ALLOWED_ORIGINS` to include `https://fisma-benefit-app-testing.github.io`, then restart or redeploy the app. The value is an origin without a path.
- In **Deploy → Configuration**, link `fisma-benefit-app/benefit-app` and enable **Automatic deploy** for `main`.
- Initialize the testing database and provision a dedicated Playwright user that can create and delete its own projects. [Scalingo maintenance](scalingo_maintenance.md) covers logs, backups, and manual migrations.

### GitHub Actions secrets

| Secret | Value |
| --- | --- |
| `TESTING_PAGES_DEPLOY_KEY` | The private half of the write deploy key on the testing Pages repository. |
| `SCALINGO_E2E_TEST_USERNAME` | Dedicated Playwright test username in the testing database. |
| `SCALINGO_E2E_TEST_PASSWORD` | Password for that user. |

Set the repository Actions variable `SCALINGO_TESTING_URL` to `https://benefit-testing.osc-fr1.scalingo.io` before running the workflow.

### Run Playwright after deployment

Confirm in the Scalingo deployment history that the latest successful deployment is the current `main` commit. Then run **Deploy Scalingo testing** on `main` from GitHub Actions. The manual run republishes the frontend, checks backend health and CORS, waits for Pages to serve that commit, and runs Playwright. Playwright is manual at this stage because Scalingo waits for push checks to finish before starting the backend deployment.

## Database backups

Before deployment, confirm the target app and check that a recent backup succeeded. Take a fresh backup before applying migrations. Use the [app names in the database guide](database.md#access-via-scalingo-cli) and the [Scalingo backup commands](scalingo_maintenance.md#backups).

For a manual backup in the database dashboard, open **Backups → Logical backups** and select **Trigger manual backup**. For a local dump, follow [Scalingo’s workstation procedure](https://doc.scalingo.com/databases/postgresql/shared-resources/guides/backing-up#from-your-workstation) using a database tunnel. Keep downloaded backups out of the repository. Before [restoring a backup](https://doc.scalingo.com/databases/postgresql/shared-resources/guides/restoring), confirm the target, recovery point, and expected downtime with the service owner.

## Production deployments

1. Open the [production Scalingo app](https://dashboard.scalingo.com/apps/osc-fr1/benefit) and manually deploy the intended revision from `main`. Apply any required migrations in the order described in the [database guide](database.md).
2. Confirm the deployment succeeded and the [production health endpoint](https://benefit.osc-fr1.scalingo.io/actuator/health) reports `UP`.
3. Copy the full commit SHA from that successful Scalingo deployment. Run [Publish production frontend](../../.github/workflows/run-deployments.yml) on `main` and paste it into `backend_sha`. The workflow builds from the supplied commit, even if `main` has advanced since the backend deploy. It reads the API URL from the GitHub Actions variable `PRODUCTION_URL`.
4. Confirm the workflow verified the [Pages SHA](https://fisma-benefit-app.github.io/benefit-app/version.json), then verify login in the [production app](https://fisma-benefit-app.github.io/benefit-app/). The Scalingo history is the source for the backend SHA.

Leave **Automatic deploy** disabled on the production Scalingo app. If the Pages publish fails, check the currently deployed SHA in Scalingo, then retry the frontend workflow with that SHA.

For testing, see [Scalingo testing environment](#scalingo-testing-environment). To redeploy testing manually, deploy `main` from the testing Scalingo dashboard, then run **Deploy Scalingo testing** on `main` from Actions.

## Manual deployment to frontend from CLI

For normal production frontend publishes, use the workflow above. If recovering from the CLI, check out the exact commit serving production in Scalingo before publishing.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set .env variables

Create or edit `frontend/.env.production` and `frontend/.env.testing` with the correct backend URL and GitHub Pages base path:

```bash
# .env.production
VITE_API_URL=https://benefit.osc-fr1.scalingo.io
VITE_BASE_PATH=/benefit-app/
```

```bash
# .env.testing
VITE_API_URL=https://benefit-testing.osc-fr1.scalingo.io
VITE_BASE_PATH=/scalingo/
```

`VITE_BASE_PATH` must be set here so that Vite knows to dynamically set the base path according to the run deployment script. Without `VITE_BASE_PATH`, deployment fails. You also need the correct backend URLs for `VITE_API_URL`. The hosted URLs are shown above.

### 3. Build & Deploy

Make sure you have pulled the latest changes in the `main` branch. Deployment to production and testing environments is done from the `main` branch.

```bash
# To deploy to testing environment
git switch main
git pull origin main
cd frontend
npm run deploy:testing
```

```bash
# To recover the production frontend
git fetch origin main
git switch --detach SCALINGO_DEPLOYMENT_SHA
cd frontend
GITHUB_SHA=$(git rev-parse HEAD) npm run deploy:production
```

`deploy:testing` pushes to the [testing GitHub Pages site](#testing-github-pages-site) over SSH, so your own SSH key needs write access to `fisma-benefit-app-testing/fisma-benefit-app-testing.github.io`.

These run:

- predeploy → builds into `dist/`
- production:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch)
- testing:
  - deploy → publishes `dist/` to the testing GitHub Pages site (`fisma-benefit-app-testing/fisma-benefit-app-testing.github.io`, `gh-pages` branch, `scalingo` directory)

### 4. Verify deployment

- Check the GitHub repo's Settings → Pages to confirm deployment (`benefit-app` for production, `fisma-benefit-app-testing.github.io` for testing)
- Access production frontend at: https://fisma-benefit-app.github.io/benefit-app/
- Access testing frontend at: https://fisma-benefit-app-testing.github.io/scalingo/

## Important notes

- Always backup the database before backend deployment
- Ensure `.env.testing` and `.env.production` have the correct backend URLs and base paths before building frontend to testing or production
- Run correct frontend deployment scripts to deploy to correct environments (`npm run deploy:testing` for testing, `npm run deploy:production` for production)
