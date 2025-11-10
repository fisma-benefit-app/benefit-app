# Deployment Guide

This guide describes the step-by-step process of deploying the backend (Heroku) and frontend (GitHub Pages).

We can deploy the app to two different environments: testing (staging) and production environments. Testing deployments run **automatically** and production deployments must be done **manually**. Automated deployments are the preferred way of deploying the app. However, if needed, all deployments can be done manually.

### Prerequisites

- Heroku account with CLI installed for logging (see [the guide](./heroku_cli_setup.md) on this if needed)
- Access to repo: https://github.com/fisma-benefit-app/benefit-app
- Database credentials available in Heroku Config Vars
- Heroku backend URLs set up in GitHub Actions repository secrets: `HEROKU_PRODUCTION_URL` and `HEROKU_TESTING_URL`

URL values can be found in the `backend-credentials` repository.

## Deployment workflow

Our deployments are handled via Heroku and a GitHub Actions workflow `run-deployments`. See the workflow file here: [run-deployments.yml](../../.github/workflows/run-deployments.yml)

The workflow file is triggered when any backend deployment is done in Heroku. Testing deployments occur automatically after each merge to the `main` branch (i.e., when changes are merged into `main`). Production deployments are triggered manually in Heroku, which then triggers the frontend production deployment via automated workflow.

The workflow file recognizes which GitHub repository environment (`fisma-benefit-app` for production and `fisma-benefit-app-testing` for testing) is deployed in Heroku, and based on this deploys frontend to either production or testing.

## Backup Database
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

## Manual deployments

Every deployment can be run manually:
- manual backend deployments to Heroku are done in Heroku dashboard (requires to be logged in)
- manual frontend deployments to GitHub Pages are done from CLI

## Manual deployment to backend in Heroku

You might want to do a manual deployment in case something goes wrong with the automated workflow. Follow these steps:

1. Open the correct Heroku app (must be logged in):
- production: https://dashboard.heroku.com/apps/fisma-benefit-app
- testing: https://dashboard.heroku.com/apps/fisma-benefit-app-testing
2. Go to Deploy tab
3. Ensure GitHub repository (`fisma-benefit-app/benefit-app`) is connected: we use the same repository for both testing and production deployments
4. Under `Manual deploy`, select `main` branch and click `Deploy Branch`
5. This deploys only the backend to Heroku (thanks to `subdir-heroku-buildpack`)

### Backend logging

Use Heroku CLI to monitor backend logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app # production logs
heroku logs --tail --app fisma-benefit-app-testing # testing logs
```

## Manual deployment to frontend from CLI

If you, for some reason, want to do manual frontend deployment to any environment in GitHub Pages, follow these steps:

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set .env variables

Create or edit `frontend/.env.production` and `frontend/.env.testing` with the correct backend URL and GitHub Pages base path:

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
# This is a GitHub Pages limitation, and the automated workflow takes this into account
```

These run:
- predeploy → builds into `dist/`
- production:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch)
- testing:
  - deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch, `testing` directory)

### 4. Verify deployment

- Check GitHub repo Settings → Pages to confirm deployment
- Access production frontend at: https://fisma-benefit-app.github.io/benefit-app/
- Access testing frontend at: https://fisma-benefit-app.github.io/benefit-app/testing/

## Automatic deployments

Automatic deployments are used when deploying the app to production and testing environments. This is the usual way to do deployments.

### Production deployments

Production deployment is initiated **manually**, but it runs **automatically**. To deploy to production environments, follow these steps:

1. Open Heroku production app: https://dashboard.heroku.com/apps/fisma-benefit-app
2. Go to Deploy tab
3. Ensure GitHub repository `fisma-benefit-app/benefit-app` is connected: we use the same repository for both testing and production deployments
4. Under `Manual deploy`, select `main` branch and click `Deploy Branch`
5. This triggers the `run-deployments` GitHub Actions workflow which
  - echos a message that backend production deployment is handled by Heroku and not the workflow itself
  - deploys frontend to GitHub Pages production environment
  - waits for the frontend production deployment to finish
  - deploys frontend to GitHub Pages testing environment

Heroku deploys only the `backend` directory thanks to the `subdir-heroku-buildpack` using the `PROJECT_PATH` config variable.

**IMPORTANT:** We need to deploy frontend to testing environment after doing the production deployment. This is due to GitHub Pages limitations: the production deployment erases the frontend testing environment. This is because the frontend testing environment is a subpage in our GitHub Pages production page, so deployment to production deploys the whole page again. Running frontend testing deployment re-creates this subpage.
- Production URL: https://fisma-benefit-app.github.io/benefit-app/
- Testing URL: https://fisma-benefit-app.github.io/benefit-app/testing/ <-- "testing" subpage under production URL

### Production logging

Use Heroku CLI to monitor backend logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app
```

Frontend build logs (GitHub Actions) can be found here: https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages-build-deployment”)

### Testing deployments

Testing deployment is initiated **automatically**, and it runs **automatically**. The testing deployment process works as follows:

1. Heroku testing app is set up to automatically deploy to testing after each merge to `main`. There is no need to manually trigger the testing deployment in Heroku (but it can be done, for example, in case of deployment issues).
2. Heroku's automatic deployment triggers the `run-deployments` GitHub Actions workflow which
  - echos a message that backend testing deployment is handled by Heroku and not the workflow itself
  - deploys frontend to GitHub Pages testing environment

Heroku deploys only the `backend` directory thanks to the `subdir-heroku-buildpack` using the `PROJECT_PATH` config variable.

### Testing logging

Use Heroku CLI to monitor backend logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app-testing
```

Frontend build logs (GitHub Actions) can be found here: https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages-build-deployment”)

## Important notes

- Always backup the database before backend deployment
- Ensure `.env.testing` and `.env.production` have the correct Heroku backend URLs and base paths before building frontend to testing or production
- Run correct frontend deployment scripts to deploy to correct environments (`npm run deploy:testing` for testing, `npm run deploy:production` for production)
