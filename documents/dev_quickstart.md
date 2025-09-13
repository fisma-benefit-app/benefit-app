# Benefit App — Quickstart (Short)

## 1) Prerequisites
- **Docker** installed (and running).
- Or, for local-only dev (without Dockerized backend): 
    - a local **PostgreSQL** installation (or use only the dockerized database. see 3B).
    - **Java 21**
    - **Nodejs** and **npm**

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
| You can change them as you wish, but the dev environment should usually work with the default values.

---

## 3) Run Options

### A) Full Dockerized Setup
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

### B) Development Without Docker (local backend)
1. You only need the **frontend .env** file (`frontend/.env` with VITE_API_URL pointing to your backend).
2. If you have previously run Docker, clean backend build dirs once to avoid permission issues:
   ```bash
   sudo rm -rf backend/.gradle backend/build
   ```
3. Make sure a Postgres DB is available:
   - Run only Postgres via Docker:
     ```bash
     docker compose up db
     ```
   - Or use your own Postgres locally (check port/credentials in `backend/src/main/resources/application.yaml`).
4. Start backend:
   ```bash
   cd backend
   ./gradlew bootRun
   ```
5. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## (Optional) Quick Troubleshooting
- **No seed users** → ensure backend has `spring.sql.init.mode=always` in `application.yaml` or `SPRING_SQL_INIT_MODE=always` in Docker Compose, then reset DB once.
- **Hot reload flaky in Docker** → keep `CHOKIDAR_USEPOLLING=true`.
- npm install fails because of permissions? -> `rm -rf node_modules` inside the frontend folder

---

## (Optional) Notes
- Change host ports in `.env` if 5173/8080/5433 are taken.
- Use a DB GUI (e.g., DBeaver) with host `localhost`, port `5433`, db `fisma_db`, user `myuser`, pass `secret`.