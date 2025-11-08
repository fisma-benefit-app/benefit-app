# Caching Guide

This guide describes what caches there are and how to clear them at different layers.

## Caches Used

Frontend, backend, Heroku
App-specific: centralizedCalculations uses its own memoization cache

### (Optional) Troubleshooting

If changes don’t appear after redeploy:

- Clear browser cache.
- Clear Vite cache.
- Clear Gradle cache (local dev only).
- Purge Heroku build cache.

## Clearing Cache

### 1. Frontend

- **Browser cache & cookies**: Clear from browser settings (e.g. on Chrome: Settings → Privacy → Clear browsing data).
- **Vite pre-bundling cache**: Vite caches optimized dependencies locally. To clear:

  ```sh
  rm -rf node_modules/.vite
  ```

Docs: [Vite Caching Guide](https://vite.dev/guide/dep-pre-bundling)

### 2. Backend

- **Spring Boot caching**: Spring caches are not used by default, but if enabled, see Spring Cache Reference:

  ```sh
  ./gradlew clean build --no-build-cache
  rm -rf ~/.gradle/caches/
  ```

Docs: [Gradle Build Cache](https://docs.gradle.org/current/userguide/build_cache.html)

### 3. Deployment (Heroku)

- **Heroku build cache**: Heroku keeps cached build artifacts between deploys. To purge build cache (requires Heroku Labs plugin):

  ```sh
  heroku plugins:install heroku-builds
  heroku builds:cache:purge -a <app-name>
  ```

Docs: [Heroku Build Cache](https://help.heroku.com/18PI5RSY/how-do-i-clear-the-build-cache)
