# Deployment Guide

This guide describes the step-by-step process of deploying the backend (Heroku) and frontend (GitHub Pages).

We can deploy the app to two different environments: testing (staging) and production environments.

## Backend Deployment (Heroku)

- Testing:
  - Heroku App Dashboard (testing): https://dashboard.heroku.com/apps/fisma-benefit-app-testing
  - Testing backend URL: https://fisma-benefit-app-testing-XXXXXXXXX.herokuapp.com/
- Production:
  - Heroku App Dashboard (production): https://dashboard.heroku.com/apps/fisma-benefit-app
  - Production backend URL: https://fisma-benefit-app-XXXXXXXXX.herokuapp.com/

### Prerequisites

- Heroku account with CLI installed (see [the guide](./heroku_cli_setup.md) on this if needed)
- Access to repo: https://github.com/fisma-benefit-app/benefit-app
- Database credentials available in Heroku Config Vars

### 1. Backup Database

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

### 2. Deploy via Heroku Dashboard

1. Open Heroku app:
   - for testing: https://dashboard.heroku.com/apps/fisma-benefit-app-testing
   - for production: https://dashboard.heroku.com/apps/fisma-benefit-app
2. Go to Deploy tab
3. Ensure GitHub repository `fisma-benefit-app/benefit-app` is connected: we use the same repository for both testing and production deployments
4. Select correct branch and click `Deploy Branch`
   - for testing, select branch `sprint/X`
   - for production, select branch `main`

Heroku deploys only the `backend` directory thanks to the `subdir buildpack` using the `PROJECT_PATH` config variable.

### 3. Check Logs

Use Heroku CLI to monitor logs:

```bash
heroku login
heroku logs --tail --app fisma-benefit-app-testing
heroku logs --tail --app fisma-benefit-app
```

## Frontend Deployment (GitHub Pages)

- GitHub Pages Dashboard: https://github.com/fisma-benefit-app/benefit-app/settings/pages
- Build logs (GitHub Actions): https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages-build-deployment”)

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

`VITE_BASE_PATH` must be set here so that Vite knows to dynamically set the base path according to the run deployment script. Without `VITE_BASE_PATH`, deployment fails.

### 3. Build & Deploy

Make sure to have pulled the latest changes in `sprint/X` and `main` branches. In `sprint/X`, `X` is the number of the current sprint.

Deployment to testing environment is done from the `sprint/X` branch. Deployment to production environment is done from the `main` branch.

```bash
# To deploy to testing environment
git switch sprint/X
git pull origin sprint/X
cd frontend
npm run deploy:testing
```

```bash
# To deploy to production environment
git switch main
git pull
cd frontend
npm run deploy:production
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
- Run frontend deployment scripts from correct branches (`sprint/X` branch for testing, `main` for production)
