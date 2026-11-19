> **Historical document — archived 2026-11-19.** Superseded by [current guidance](../guides/development.md#reset-this-local-project). Commands and configuration below may be outdated or destructive; use the current guide for operational work.

# How to Reset Installation

This guide details how you can reset your local setup in case of inconsistencies (e.g. schema mismatches, corrupted caches).

## 1. Basic Reset

- Shut down backend and frontend.
- Clear caches (see [caching.md](./caching_2026-11-19.md)).
- Restart backend and frontend.

## 2. If Using Docker

### Option A: Reset Only This Project

From the project root:

```sh
docker compose down -v
docker compose up --build
```

This removes containers and volumes for the Benefit app only and rebuilds the stack.

### Option B: Full Docker Reset (Destructive)

If the above doesn’t work:

```sh
docker system prune -a -f --volumes
```

**Warning**: This deletes all Docker images, containers, and volumes on your machine, not just the Benefit app.

## 3. If Using Local Database (No Docker)

1. Connect to Postgres:

```sh
psql -U <username> -d postgres
```

2. Drop and recreate the application database:

```sql
DROP DATABASE IF EXISTS fisma_db;
CREATE DATABASE fisma_db;
```

3. Restart backend to reinitialize schema.

## 4. Verification

- Check that containers are running:

```sh
docker ps
```

- Check database connection:

```sh
docker exec -it fisma_db psql -U $POSTGRES_USER $POSTGRES_DB
```

- Backend logs should show successful startup without schema errors.
