# Deployment Guide

This guide describes the step-by-step process of deploying the backend (Heroku) and frontend (GitHub Pages). For a more detailed reference, see [deployment_setup.md](../references/deployment_setup.md).

## 1. Backend Deployment (Heroku)

- Heroku App Dashboard: https://dashboard.heroku.com/apps/fisma-benefit-app
- Backend URLs look like: https://fisma-benefit-app-XXXXXXXXX.herokuapp.com/

### Prerequisites

- Heroku account with CLI installed (see [the guide](./heroku_cli_setup.md) on this if needed)
- Access to repo: https://github.com/loota/fisma-backend-alt
- Database credentials available in Heroku Config Vars

### 1. Backup Database

Before any deployment, ensure a database backup is taken.

```sh
pg_dump <db-url> > backup.sql
```

(Get credentials from the `backend-credentials` repo.)

### 2. Update Backend Repo

Because Heroku requires the backend at repo root, we maintain a mirror repo: https://github.com/loota/fisma-backend-alt

Steps:

1. Copy changes from the main repo into the fisma-backend-alt repo.
2. Commit and push changes to GitHub.

```sh
git add .
git commit -m "Deploy update"
git push origin main
```

### 3. Deploy via Heroku Dashboard

1. Open Heroku app: https://dashboard.heroku.com/apps/fisma-benefit-app
2. Go to Deploy tab
3. Ensure GitHub repo loota/fisma-backend-alt is connected
4. Select correct branch and click Deploy Branch

### 4. Check Logs

Use Heroku CLI to monitor logs:

```sh
heroku login
heroku logs --tail --app fisma-benefit-app
```

## Frontend Deployment (GitHub Pages)

- GitHub Pages Dashboard: https://github.com/fisma-benefit-app/benefit-app/settings/pages
- Build logs (GitHub Actions): https://github.com/fisma-benefit-app/benefit-app/actions (look for “pages build and deployment”)

### 1. Install dependencies

```sh
cd frontend
npm install
```

### 2. Set API URL

Edit `frontend/.env.production` with the backend URL:

```sh
VITE_API_URL=https://fisma-benefit-app-XXXXXXXXX.herokuapp.com
```

### 3. Build & Deploy

```sh
npm run deploy
```

This runs:

- predeploy → builds into `dist/`
- deploy → publishes `dist/` to GitHub Pages (`gh-pages` branch)

### 4. Verify deployment

- Check GitHub repo Settings → Pages to confirm deployment
- Access frontend at: https://fisma-benefit-app.github.io/benefit-app/

## Quick Reference

- Backend deploy command: _Deploy branch from Heroku dashboard_

- Backend logs:

```sh
heroku logs --tail --app fisma-benefit-app
```

- Frontend deploy command:

```sh
npm run deploy
```

## Important notes

- Always backup the database before backend deployment.
- Ensure .env.production has the correct Heroku backend URL before building frontend.
- Backend updates must go through the fisma-backend-alt repo (due to Heroku’s requirement for root-level backend).
