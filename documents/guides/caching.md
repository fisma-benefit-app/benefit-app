# Caching Guide

This guide describes what caches there are and how to clear them at different layers.

## Caches Used

Benefit uses two caches by default and also implements an app-specific cache for memoization in the frontend.

### Pre-bundling and build caches

By default, Vite and Heroku caches are used. The Vite cache is used for pre-bundling dependencies in the frontend, while Heroku caches build artifacts between deploys.

Spring cache can be enabled if needed, but is disabled by default. It caches backend build artifacts when enabled.

### App-specific Memoization Cache

Benefit's memoization cache is used for functional point calculations in the frontend, specifically in [`centralizedCalculations.ts`](../../frontend/src/lib/centralizedCalculations.ts). It caches component-specific keys to make calculations more lightweight.

The keys are based on functional component ID, name, type, degree of completion, and all calculation parameters. When used, recalculation happens only when data changes within the functional components, thus improving speed and decreasing the amount of data transfer needed.

The cache is monitored and cleared with the functions `getCacheSize()` and `clearCalculationCache()` respectively. These can be used via devtools for debugging if needed.

## Clearing Cache

Sometimes old data or code may appear due to caching. If changes don’t appear after e.g. dependency updates, build failures, or bugs regarding calculations, consider clearing cache.

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

### 4. Memoization Cache

- **Benefit's memoization cache**: Use `clearCalculationCache()` via devtools.
