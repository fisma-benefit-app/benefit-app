# Benefit App Logs

## Backend

Default Spring Boot logging is used:
https://docs.spring.io/spring-boot/reference/features/logging.html

Gradle is used as a build tool: https://docs.gradle.org/current/userguide/logging.html

**build.gradle** has the parameter **showStandardStreams**

### Heroku environment

```sh
heroku logs --app fisma-benefit-app --tail
```

### Local environment

The application outputs all logs to the terminal window where the application was started from.

## Frontend

Browser console contains all other logging apart from the build log.

### Heroku environment

Build log is in https://github.com/fisma-benefit-app/benefit-app/actions

### Local environment

Build log is output in the terminal window used to start the application.

## Heroku CLI installation

**1.** Install Heroku CLI by following instructions from:

```sh
https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
```

**2.** Open MS default terminal and type:

```sh
heroku login
```

<img width="778" alt="asdasd" src="https://github.com/user-attachments/assets/f968bf6e-b5d3-4204-bb48-3de80e985eab" />
<img width="337" alt="ffds" src="https://github.com/user-attachments/assets/39b2cdcc-4d18-4934-880a-46115d291d4a" />

Then browser window opens and asks you to login with Heroku Credentials

**3.** Run following command to get access to Heroku app logs:

```sh
heroku logs --app fisma-benefit-app --tail
```

<img width="946" alt="gfjfdskjfs" src="https://github.com/user-attachments/assets/763d9070-1c91-4d36-9165-1e422ccf123e" />
