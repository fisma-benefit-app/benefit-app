# Logging Guide

This logging guide describes how logs are used within the Benefit app both in local development and the Heroku production environment.

| Type of log      | Local                          | Heroku (Production)                |
| ---------------- | ------------------------------ | ---------------------------------- |
| Backend runtime  | Terminal (`./gradlew bootRun`) | `heroku logs --tail` (ephemeral)   |
| Frontend build   | Terminal (`npm run dev`)       | GitHub Actions build logs          |
| Frontend runtime | Browser DevTools console       | Browser DevTools console           |
| Test logs        | `./gradlew test`               | CI/CD logs (GitHub Actions/Heroku) |

## Prerequisites

If you wish to view logs in production, you'll need to have Heroku CLI installed. Refer to [the guide](/documents/guides/heroku_cli_setup.md) on this if needed.

## Backend (Spring Boot, Java)

The backend uses Spring Boot’s default logging. By default, Spring Boot uses Logback, and logs appear in the terminal.

### Log levels

The Benefit application logs Spring Security events as specified in `application.yaml`:

```yaml
logging:
  level:
    org.springframework.security: info # General security events
    org.springframework.security.web: debug # Web-specific details (filters, requests)
    org.springframework.security.oauth2: debug # OAuth2 flows, tokens
```

**Warning!** Avoid using `DEBUG` in production as it can flood logs and expose sensitive details like credentials or tokens. Instead, Spring Security events should be logged using level `INFO`:

```yaml
logging:
  level:
    org.springframework.security: info
```

Loggers and their levels can be configured by editing `application.yaml`. (Optional) examples:

```yaml
logging:
  level:
    root: "warn" # Set root logger level to `WARN`
    fi.fisma.backend: "debug" # Set the logger level for backend to `DEBUG`
  file:
    name: "benefit-app.log" # Write logs to a file (`benefit-app.log`)
```

More information on using log levels can be found in Spring Boot's [documentation](https://docs.spring.io/spring-boot/reference/features/logging.html).

### Local Environment

When running locally, the application outputs logs to the terminal.

### Heroku environment

Heroku logs are ephemeral (about 1500 lines retained). You can view them using the command line:

```sh
heroku logs --app fisma-benefit-app --tail
```

`--tail` streams logs in real time. You can exit using `Ctrl+C`.

(Optional) examples:

```sh
# Fetch the last 200 lines
heroku logs --app fisma-benefit-app --num=200

# Filter logs by dyno type (web, worker, etc.)
heroku logs --app fisma-benefit-app --dyno=web
```

More information on logs within the Heroku environment can be found in Heroku's [documentation](https://devcenter.heroku.com/articles/logging). Heroku logs are not persisted.

### Test output (Gradle)

The Gradle test task is configured in `build.gradle` to provide detailed feedback when running tests:

```groovy
test {
    testLogging {
        events "passed", "skipped", "failed" // Show results for passed, skipped, and failed tests

        // Show full stack traces, causes, and exceptions
        showExceptions true
        exceptionFormat "full"
        showCauses true
        showStackTraces true

        // Set to true for verbose output
        showStandardStreams = false
    }
}
```

These logs can be seen in the terminal by running `./gradlew test` or as part of the build log within the Heroku environment. Test results run by `./gradlew test` are saved in `build/reports/tests/`.

## Frontend (React, Vite, TypeScript)

### Build logs

Local build logs are shown in the terminal where you run `npm run dev`. Using Heroku, build logs are found in [GitHub Actions](https://github.com/fisma-benefit-app/benefit-app/actions).

### Runtime logs

At runtime, logs and errors appear in the browser developer console. Open DevTools and switch to the Console tab.

## Troubleshooting

- No logs showing? Check if dynos are running with:

```sh
heroku ps --app fisma-benefit-app
```

- Heroku CLI not found? Ensure it’s installed and added to your PATH.
- Too much noise in logs? Adjust log levels in application.yaml.
- Need more details from tests? Set showStandardStreams = true in build.gradle.
