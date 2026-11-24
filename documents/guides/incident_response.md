# Restore service during an incident

Use this guide when production, testing, or a local environment is unavailable or behaving unexpectedly. Start with the affected environment and observable failure; architecture knowledge is optional.

## First few minutes

1. Record the affected URL, time (with timezone), visible error, and whether other users are affected. Preserve unsaved work before reloading an editor.
2. Identify the provider and environment below. Check backend health, recent deployment history, and logs before changing anything.
3. Use the symptom table to choose the smallest recovery action. Record each change and its result so the next responder can continue.
4. Verify recovery through the browser and backend, then record the cause or remaining uncertainty in an issue.

If you lack access, ask the organization's repository/hosting administrators for the affected environment. The [project contact](../../README.md#contact) is a hand-off contact; this repository does not define an on-call rota. Do not share credentials or tokens in an issue.

## Identify and check the environment

Open the affected frontend from the [service list](../../README.md#services-and-environments). In browser DevTools → Network, inspect the failing request's URL and status. That URL identifies which backend the browser is actually using.

| Environment | Management / backend target | Health check |
| --- | --- | --- |
| Scalingo production | [Dashboard: osc-fr1 / benefit](https://dashboard.scalingo.com/apps/osc-fr1/benefit) | [Backend health](https://benefit.osc-fr1.scalingo.io/actuator/health) |
| Scalingo testing | [Dashboard: osc-fr1 / benefit-testing](https://dashboard.scalingo.com/apps/osc-fr1/benefit-testing) | [Backend health](https://benefit-testing.osc-fr1.scalingo.io/actuator/health) |
| Local development | Repository checkout, development Compose stack | [Backend health](http://localhost:8080/actuator/health) |
| Self-hosted / UpCloud | Server checkout and `docker-compose.prod.yaml`; see [server guide](upcloud_deployment.md) for access/setup | On the server's public origin, request `/api/actuator/health` through nginx. |

A successful health response reports `UP`. Also test the failing user action: health alone does not prove login, frontend configuration, permissions, or saving work.

Get server addresses and access credentials from the current administrators.

### Scalingo status and logs

Use an authenticated [Scalingo CLI](https://doc.scalingo.com/tools/cli/start):

```bash
scalingo --app benefit-testing --region osc-fr1 ps
scalingo --app benefit-testing --region osc-fr1 deployments
scalingo --app benefit-testing --region osc-fr1 logs --follow
```

For production, replace `benefit-testing` with `benefit` in the commands above. For testing, check which job failed in [Deploy Scalingo testing](../../.github/workflows/deploy-scalingo-testing.yml). The frontend exposes its deployed revision in [version.json](https://fisma-benefit-app-testing.github.io/scalingo/version.json). The [maintenance guide](scalingo_maintenance.md) covers database checks and backups.

### Local or self-hosted Docker logs

For local development, run from the repository root:

```bash
docker compose ps
docker compose logs --tail=200 backend frontend db
```

For a self-hosted server, run from its checkout and explicitly select the production Compose file:

```bash
docker compose -f docker-compose.prod.yaml ps
docker compose -f docker-compose.prod.yaml logs --tail=200 backend frontend db
```

Add `-f` to `logs` to follow output. Frontend runtime errors are in the browser Console and Network tabs; container logs show the server side. GitHub Pages build/deploy failures are in [Actions](https://github.com/fisma-benefit-app/benefit-app/actions). Local backend test reports are in `backend/build/reports/tests/test/` after a test run.

## Choose a recovery action

| What you observe | Next action | How to confirm |
| --- | --- | --- |
| Page fails to load or assets return 404 | Check Pages deployment logs and the requested asset paths. Compare with the last successful deployment; check the configured base path. | Page loads and asset requests succeed after deployment. |
| Page loads, but API calls fail | Check the actual API URL, health, backend logs, and browser status. `undefined/token` indicates frontend configuration; CORS errors require the correct allowed origin. | Browser calls reach the intended API and sign-in succeeds. |
| Backend is stopped/crashing | Capture startup errors. Check provider status/resources, database availability, required configuration, and recent changes. Restart only when the cause supports it. | Process stays running, health reports `UP`, and the failing action succeeds. |
| Only one user's session fails (`401`) | Preserve unsaved work and sign in again. Check session expiry/revocation in the [authentication guide](authentication.md) if it persists. | A fresh session works. |
| Request returns `403` | Check membership/role and the endpoint's [permissions](../references/api.md). For login, inspect origin/security logs. | The intended authorized user can perform the action. |
| Save returns `409` or reports a newer version | Preserve unsaved changes, reload current data, and reconcile edits. See [save conflicts](../references/architecture.md#follow-a-project-save). | Changes are saved against the current version without overwriting another user's work. |
| Database connection/schema errors | Check database status, connection configuration, and applied migrations using the [database guide](database.md). Back up before changes. | Backend connects and the affected read/write succeeds. |
| Old UI remains after a successful deployment | Preserve unsaved work, hard reload, and compare deployed revisions before clearing anything. | Browser serves the intended assets and calls the matching backend. |
| Build fails with dependency/cache errors | Read the failing build log; use the targeted cache remedies below if supported by that error. | A rebuild succeeds and the intended revision is deployed. |

### Restart or roll back

Use [Scalingo container controls](https://doc.scalingo.com/tools/cli/features) for the affected service. A restart interrupts requests. Capture evidence first, confirm the target, and tell other responders what you are changing. These examples restart only the backend process:

```bash
# Scalingo testing
scalingo --app benefit-testing --region osc-fr1 restart

# Scalingo production
scalingo --app benefit --region osc-fr1 restart

# Self-hosted server, from its checkout
docker compose -f docker-compose.prod.yaml restart backend
```

For local development, backend startup under `dev` deletes and reseeds data. Follow [development troubleshooting](development.md#troubleshoot-by-symptom) instead of applying server procedures blindly.

If an incident began with a deployment, identify the last working revision and compare schema/configuration requirements before rolling back. Use the provider's release/deployment controls and the [deployment guide](deployment_guide.md); coordinate the frontend and backend revisions. A [Scalingo rollback](https://doc.scalingo.com/platform/app/rollback) redeploys the backend revision. Check database compatibility and restore the matching frontend separately if needed.

On a server, `update_server.sh` pulls code, builds, backs up, applies migrations, and restarts; it is a deployment, not a simple restart.

## Caches: target the failing layer

A browser hard reload is the first step for stale assets. Clearing site storage also removes the saved login; preserve unsaved work first. Runtime data errors and incorrect calculations need investigation, not a cache purge. Benefit does not enable a Spring application cache by default.

For local Vite and Gradle build problems, use [development cache guidance](development.md#caches-and-build-artifacts). Avoid whole-machine Docker prune or deleting database volumes during hosted recovery.

### Scalingo deployment cache

If a build fails because of stale cached artifacts, clear the deployment cache for the affected Scalingo app. This example targets testing.

```bash
scalingo --app benefit-testing --region osc-fr1 deployment-delete-cache
```

The [cache reset](https://doc.scalingo.com/platform/deployment/cache) applies to the next build. Redeploy the intended revision through the [deployment guide](deployment_guide.md).

## Protect data while recovering

Never set `SPRING_PROFILES_ACTIVE=dev` on a hosted environment, enable automatic schema initialization, or reset its volumes as a repair. The dev profile reseeds data, and its local-host guard cannot distinguish a server-local database from a laptop database.

Use the [database guide](database.md) and provider backup procedures before schema/data changes. A restore can overwrite data written after the backup: establish the recovery point and coordinate it with the service owner. Preserve signing keys during ordinary recovery; changing `JWT_PRIVATE_KEY` invalidates existing sessions.

Keep error-detail exposure (`API_DEBUG`, default `never`) and security logging (`API_DEBUG_LEVEL`, default `info`) at their normal values unless a specific investigation needs a temporary change. Revert it afterwards. Logs and browser exports may contain tokens, credentials, or user data; sanitize them before sharing.

## Verify and hand off

1. Confirm health, page loading, and login in the affected environment.
2. Recheck the original failing action. With an authorized disposable test project, verify save/reload if saving was affected; do not alter real user projects merely to test.
3. Confirm frontend/backend revisions and watch for recurring errors after recovery.
4. Record the timeline, observed cause, changes, verification, and remaining work in an issue. Include links to deployments and sanitized evidence so the next responder can continue.

Access gaps, unverified addresses, and provider settings discovered during an incident should become documentation fixes. Keep the recovery steps here and link platform-specific detail rather than requiring responders to read the whole hand-off documentation.
