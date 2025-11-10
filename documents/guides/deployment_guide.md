# Deployment Guide

This guide describes the step-by-step process of deploying the backend (Heroku) and frontend (GitHub Pages).

We can deploy the app to two different environments: testing (staging) and production environments.

### Prerequisites

- Heroku account with CLI installed for logging (see [the guide](./heroku_cli_setup.md) on this if needed)
- Access to repo: https://github.com/fisma-benefit-app/benefit-app
- Database credentials available in Heroku Config Vars
- Heroku backend URLs set up in GitHub Actions repository secrets: `HEROKU_PRODUCTION_URL` and `HEROKU_TESTING_URL`

URL values can be found in the `backend-credentials` repository.

## 1. Deployment workflow

Our deployments are handled via Heroku and a GitHub Actions workflow `run-deployments`. See the workflow file here: [run-deployments.yml](../../.github/workflows/run-deployments.yml)

The workflow file is triggered when any backend deployment is done in Heroku. Deployment to testing is done automatically on each merge to `main` branch, and deployment to production is done manually in Heroku, which triggers the frontend production deployment.

The workflow file recognizes which environment (`fisma-benefit-app` for production and `fisma-benefit-app-testing` for testing) is deployed in Heroku, and based on this deploys frontend to either production or testing.

## 2. Backup Database

Before any deployment, ensure a database backup is taken. Get credentials from the `backend-credentials` repo.

```bash
# Make database backup
pg_dump <db-url> > backup.sql

# Example: pg_dump postgres://username:password@host:port/dbname > backup.sql
```

```bash
# To restore the database if needed
psql <db-url> < backup.sql

# Example: psql postgres://username:password@host:port/dbname < backup.sql
```

## 3. Deploy to production

To deploy to production environments, follow these steps:

1. Open Heroku production app: https://dashboard.heroku.com/apps/fisma-benefit-app
2. Go to Deploy tab
3. Ensure GitHub repository `fisma-benefit-app/benefit-app` is connected: we use the same repository for both testing and production deployments
4. Under `Manual deploy`, select `main` branch and click `Deploy Branch`
5. This triggers the `run-deployments` GitHub Actions workflow which
  - echos a message that backend production deployment is handled by Heroku and not the workflow itself
  - deploys frontend to GitHub Pages production environment
  - waits for the frontend production deployment to finish
  - deploys frontend to GitHub Pages testing environment

Heroku deploys only the `backend` directory thanks to the `subdir buildpack` using the `PROJECT_PATH` config variable.

**IMPORTANT:** We need to deploy frontend to testing environment after doing the production deployment, because due to GitHub Pages limitations, the production deployment erases the frontend testing environment. This is because the frontend testing environment is a subpage in our GitHub Pages production page, so deployment to production deploys the whole page again. Running frontend testing deployment re-creates this subpage.

### Production logging

Use Heroku CLI to monitor backend logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app
```

Frontend build logs (GitHub Actions) can be found here: https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages-build-deployment”)

## 4. Deploy to testing

To deploy to testing environments, follow these steps:

1. Heroku testing app is set up to automatically deploy to testing after each merge to `main`. There is no need to manually trigger the testing deployment in Heroku.
2. Heroku's automatic deployment triggers the `run-deployments` GitHub Actions workflow which
  - echos a message that backend testing deployment is handled by Heroku and not the workflow itself
  - deploys frontend to GitHub Pages testing environment

Heroku deploys only the `backend` directory thanks to the `subdir buildpack` using the `PROJECT_PATH` config variable.

### Testing logging

Use Heroku CLI to monitor backend logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app-testing
```

Frontend build logs (GitHub Actions) can be found here: https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages-build-deployment”)

## Frontend deployment from CLI

If you, for some reason, want to do manual frontend deployment to GitHub Pages, follow these steps:

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set .env variables

Edit `frontend/.env.production` and `frontend/.env.testing` with the correct backend URL and GitHub Pages base path:

```bash
# .env.production
VITE_API_URL=https://fisma-benefit-app-XXXXXXXXX.herokuapp.com
VITE_BASE_PATH=/benefit-app/
```

```bash
# .env.testing
VITE_API_URL=https://fisma-benefit-app-testing-XXXXXXXXX.herokuapp.com
VITE_BASE_PATH=/benefit-app/testing/
```

`VITE_BASE_PATH` must be set here so that Vite knows to dynamically set the base path according to the run deployment script. Without `VITE_BASE_PATH`, deployment fails. You also need the correct backend URLs for `VITE_API_URL`. You can find the URLs in the `backend-credentials` repository.

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
# To deploy to production environment
git switch main
git pull
cd frontend
npm run deploy:production
# Wait for GitHub Pages deployment to finish (takes maybe 3 minutes)
npm run deploy:testing

# NOTE: After running production deployment, you need to run testing deployment again! 
# This is because frontend production deployment erases frontend testing environment
# This is a GitHub Pages limitation, and the workflow takes this into account
```

These run:
- predeploy → builds into `dist/`
- testing:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch, `testing` directory)
- production:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch)

### 4. Verify deployment

- Check GitHub repo Settings → Pages to confirm deployment
- Access testing frontend at: https://fisma-benefit-app.github.io/benefit-app/testing/
- Access production frontend at: https://fisma-benefit-app.github.io/benefit-app/

## Important notes

- Always backup the database before backend deployment
- Ensure `.env.testing` and `.env.production` have the correct Heroku backend URLs and base paths before building frontend to testing or production
- Run correct frontend deployment scripts to deploy to correct environments from correct branches (`npm run deploy:testing` for testing, `npm run deploy:production` for production)
