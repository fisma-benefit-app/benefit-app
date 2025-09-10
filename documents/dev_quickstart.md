# Benefit App — Quickstart (Short)

## 1) Prerequisites
- **Docker** installed (and running).

---

## 2) Setup
```bash
# clone
git clone <your-repo-url>
cd benefit-app

# root env
cp .env.example .env

# frontend env
cp frontend/.env.example frontend/.env
```
| You can change them as you wish, but the dev environment should usually work with the default values
---

## 3) Run / Stop
```bash
# start (build on first run or when Dockerfiles change)
docker compose up --build

# stop (keep DB data and caches)
docker compose down

# stop and reset EVERYTHING (DB, caches, volumes)
docker compose down -v
```

Open:
- Frontend: http://localhost:5173/benefit-app/login (Username: **user**, Password: **user**)
- Backend:  http://localhost:8080/actuator/health

---

## (Optional) Quick Troubleshooting
- **No seed users** → ensure backend has `SPRING_SQL_INIT_MODE=always` in `compose.yml`, then `docker compose down -v && docker compose up --build` once.
- **Hot reload flaky in Docker** → keep `CHOKIDAR_USEPOLLING=true`.
---

## (Optional) Notes
- Change host ports in `.env` if 5173/8080/5433 are taken.
- Use a DB GUI (e.g., DBeaver) with host `localhost`, port `5433`, db `fisma_db`, user `myuser`, pass `secret`.