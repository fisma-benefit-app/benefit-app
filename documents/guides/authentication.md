# Authentication and Authorization Guide

This guide explains how Benefit logs users in and keeps them logged in. It follows a login token (JWT) through the whole system:

- **Database → API → browser:** a username and password row in `app_users` becomes a signed JWT.
- **Browser → API → database:** each later request carries that JWT, and the backend uses it to find the user's data again.

All backend paths below are relative to `backend/src/main/java/fi/fisma/backend/`, and all frontend paths are relative to `frontend/src/`.

## Overview

```mermaid
sequenceDiagram
    participant FE as Frontend (browser)
    participant BE as Backend (Spring Security)
    participant DB as Postgres (app_users)

    Note over FE,DB: 1. Login: database → token
    FE->>BE: POST /token (Authorization: Basic base64(user:pass))
    BE->>DB: SELECT user WHERE username = ? AND deleted_at IS NULL
    DB-->>BE: id, username, BCrypt hash
    BE->>BE: BCrypt check, then sign JWT with RSA private key
    BE-->>FE: 200 with Authorization: Bearer <jwt> header and JSON body
    FE->>FE: store in sessionStorage (or localStorage with "remember me")

    Note over FE,DB: 2. Every other request: token → database
    FE->>BE: GET /projects (Authorization: Bearer <jwt>)
    BE->>BE: check signature, expiry and blacklist. Username = sub claim
    BE->>DB: SELECT projects JOIN projects_app_users JOIN app_users WHERE username = sub
    DB-->>BE: rows
    BE-->>FE: JSON
```

The JWT is the only link between a request and a database user. The backend keeps no session. It reads the username from the token's `sub` claim and looks the user up again on every request.

## A) User accounts in the database

Accounts live in the `app_users` table. It is defined in `backend/src/main/resources/schema-dev.sql`:

```sql
CREATE TABLE IF NOT EXISTS app_users
(
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL,
    password        VARCHAR(64) NOT NULL,
    deleted_at      TIMESTAMP(0) -- no fractions of seconds
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_key ON app_users (LOWER(username));
```

- `password` stores a **BCrypt hash** (`$2a$...`), never the plain password.
- `deleted_at` makes deletion a _soft delete_. A user with a non-null `deleted_at` can't log in, and a token they already hold stops working (see [Things to know](#things-to-know)).
- Users are linked to projects through `projects_app_users (project_id, app_user_id)`. This link is what decides which projects a token can reach.

Local development seed data is in `database-seed-dev.sql`. For example, the user `user` has the password `user`. The `schema-dev.sql` and seed files are used only for local development (Spring profile `dev`). The backend refuses to start with the `dev` profile against a non-local database, because the seed deletes all rows first. Changes to the testing and production databases are applied by hand (see [database.md](database.md)).

**There is no API for creating accounts.** New users are added by hand in the database with a BCrypt-hashed password (see [database.md](database.md)).

![creating app user table in the schema sql-file](../img/images_for_guides/schema_sql_app_user_creation.png)

Image: Creating the user table in the schema file (older screenshot. The table is now called `app_users`).

## B) User accounts in Java

| File                                                         | Role                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/AppUser.java`                                        | JPA entity mapped to `app_users` (`id`, `username`, `password`, `deletedAt`).                                                                                                                                                                                                      |
| `repository/AppUserRepository.java`                          | `findByUsernameActive(username)` and `findByIdActive(id)` return only users whose `deleted_at IS NULL`.                                                                                                                                                                            |
| `security/UserDetailsServiceImpl.java`                       | Adapts `AppUser` to Spring Security's `UserDetails` (`AppUserDetails`). Every user gets the single authority `ROLE_USER`.                                                                                                                                                          |
| `api/AppUserController.java` / `service/AppUserService.java` | Get your own user, change your password (stored as a new BCrypt hash), and soft-delete your own account. `PUT /appusers/{id}` rejects a changed username with `403`, because tokens identify users by username (see [D.3](#3-controllers-turn-the-token-back-into-database-rows)). |

![img.png](../img/images_for_guides/Java_AppUser_constructor.png)

Image: `AppUser.java` entity.

## C) Database → token: logging in

### 1. The frontend sends credentials

`LoginForm.tsx` calls `fetchJWT()` in `api/authorization.ts`:

```ts
fetch(`${API_URL}/token?rememberMe=${rememberMe}`, {
  method: "POST",
  headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
});
```

This is standard HTTP Basic auth: `username:password` encoded in Base64. The request only protects the password because it goes over HTTPS.

### 2. Spring Security checks the database

`SecurityConfig.securityFilterChain()` turns on `.httpBasic(...)`, so Spring's `BasicAuthenticationFilter` handles the request before `TokenController` runs:

1. `UserDetailsServiceImpl.loadUserByUsername()` first asks `LoginAttemptThrottleService` whether this username is locked out. It then calls `AppUserRepository.findByUsernameActive()`, which runs `SELECT ... FROM app_users WHERE username = ? AND deleted_at IS NULL`.
2. The `DaoAuthenticationProvider` bean (in `SecurityConfig`) checks the submitted password against the stored hash with `BCryptPasswordEncoder`.
3. On success, the failure counter for the username is reset. Spring builds an `Authentication` whose principal is an `AppUserDetails`, carrying the database `id`, `username` and `ROLE_USER`.

Failure responses:

| Situation                                                      | Response                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Unknown or soft-deleted username (`UsernameNotFoundException`) | `401 {"error":"Unauthorized"}`                                            |
| Wrong password (`BadCredentialsException`)                     | `401 {"error":"Unauthorized"}`                                            |
| 5th wrong password for a username, or any attempt while locked | `429 {"error":"Too many failed login attempts. Please try again later."}` |

The lockout lasts until 60 seconds have passed since the last failed attempt (`LoginAttemptThrottleService`: `MAX_ATTEMPTS = 5`, `WINDOW_SECONDS = 60`). The counters are kept per username, in memory.

### 3. The backend signs a JWT

`TokenController` (`POST /token`) passes the `Authentication` to `TokenService.generateToken()`, which builds these claims:

| Claim       | Value                                             | Source                                                                                    |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `iss`       | `"self"`                                          | constant                                                                                  |
| `sub`       | username                                          | `authentication.getName()`, i.e. `app_users.username`                                     |
| `userId`    | database id                                       | `AppUserDetails.getId()`, i.e. `app_users.id`                                             |
| `scope`     | `"ROLE_USER"`                                     | the principal's authorities, space-separated                                              |
| `jti`       | random UUID                                       | unique token id, used for logout and renewal                                              |
| `auth_time` | time of the login (epoch seconds)                 | copied unchanged when the token is renewed, see [E](#e-session-lifecycle-in-the-frontend) |
| `iat`       | now                                               |                                                                                           |
| `exp`       | now + 24 h, or now + 30 days if `rememberMe=true` |                                                                                           |

Example payload:

```json
{
  "iss": "self",
  "sub": "user",
  "userId": 1,
  "scope": "ROLE_USER",
  "jti": "3f1c6f0e-8a8e-4a4b-9a57-2f4f0f3c6b1d",
  "auth_time": 1699999999,
  "iat": 1699999999,
  "exp": 1700086399
}
```

The `JwtEncoder` bean signs the token with the RSA private key (algorithm RS256). The token is signed, **not encrypted**, so anyone holding it can Base64-decode and read the payload. Never put secrets in claims.

### 4. The token goes back to the browser

`TokenController` returns the token twice:

- in the response header `Authorization: Bearer <jwt>`. The header is readable from JavaScript because `Authorization` is in the CORS exposed headers (`corsConfigurationSource()`).
- in the JSON body as a `TokenResponse`: `{"token": "...", "tokenType": "Bearer", "expiresIn": 86400}`. `expiresIn` is the token's lifetime in seconds (`exp - iat`): 86400, or 2592000 when "remember me" is on.

The frontend reads the **header** value (the whole string, including `Bearer `). Tools like Postman use the body.

### 5. The frontend stores the token

`LoginForm.tsx` decodes the payload with `decodeJWT()` (`lib/jwtUtils.ts`) to get `userId`. It does not check the signature, because only the backend can do that. It then stores three keys:

| Key          | Value              |
| ------------ | ------------------ |
| `loginToken` | `Bearer <jwt>`     |
| `userInfo`   | username           |
| `userId`     | the `userId` claim |

They go into `sessionStorage` by default, which is cleared when the tab closes. With "remember me" checked they go into `localStorage`, which survives browser restarts. The same values are put into React state through `AppUserContext` (`context/AppUserProvider.tsx`).

## D) Token → database: authenticated requests

### 1. The frontend attaches the token

Every API wrapper in `api/` (`project.ts`, `comments.ts`, `profile.ts`, …) sends the stored string as-is:

```ts
const headers = { Authorization: sessionToken }; // "Bearer eyJ..."
```

### 2. The backend verifies it

Two filters check a Bearer token, in this order:

1. **`JwtRevocationFilter`** is registered in `SecurityConfig` before `SecurityContextHolderFilter`. `FilterRegistrationConfig` stops the servlet container from also registering it globally, so it runs once. The filter decodes the token with the `JwtDecoder`, which checks the signature and expiry. It then rejects the request with `401` if:
   - decoding fails (bad signature, expired, malformed): `{"error":"Invalid token"}`
   - the token has no `jti`, or its `jti` is on the blacklist: `{"error": "Token has been revoked"}`
2. **Spring's `BearerTokenAuthenticationFilter`**, enabled by `.oauth2ResourceServer(oauth2 -> oauth2.jwt(...))`, decodes the token again with the same `JwtDecoder`. The decoder is `NimbusJwtDecoder` built from the public key. The filter builds a `JwtAuthenticationToken`:
   - `getName()` returns the `sub` claim, i.e. the username
   - authorities come from `scope`, prefixed with `SCOPE_`, so they become `SCOPE_ROLE_USER`

Sessions are `STATELESS`, so nothing is remembered between requests.

### 3. Controllers turn the token back into database rows

Controllers take an `Authentication` parameter and pass `authentication.getName()` (the username) to the service layer. The username then becomes the filter in the database queries:

- **Projects:** `ProjectRepository.findAllByUsernameActive()` and `findByProjectIdAndUsernameActive()` join `projects → projects_app_users → app_users` and filter on `u.username = :username AND u.deleted_at IS NULL`. A user can only reach projects they are linked to, and a request for any other project id gets "not found".
- **Users/profile:** `AppUserService.getUserFromAuthentication()` calls `findByUsernameActive(authentication.getName())` and then compares ids. For example, users can only delete their own account.
- **Comments and functional components** follow the same pattern through their services.

**The username in `sub` is the lookup key on the backend. The `userId` claim is used only by the frontend.** No backend code reads `userId` from the token.

This is why **usernames can't be changed.** If a user could rename themselves, their old name would become free while tokens issued under it stayed valid. Whoever took that name next could then be reached with those old tokens. `AppUserService.updateAppUser` therefore rejects any change of username.

Only the unauthenticated paths skip all of this: `/actuator/health`, the OpenAPI/Swagger paths, and CORS preflight `OPTIONS` requests. All other requests need a valid token (`anyRequest().authenticated()`).

## E) Session lifecycle in the frontend

All of this lives in `context/AppUserProvider.tsx`.

- **Page reload:** `restoreSession()` reads `loginToken`, `userInfo` and `userId` from sessionStorage/localStorage. It calls `GET /auth/validateJWT`, a dummy endpoint that returns `200` only if the token passes the checks in [D.2](#2-the-backend-verifies-it). On `401` the stored session is cleared. On a network error the session is kept.
- **Auto-logout:** a timer fires `logout()` at the token's `exp`.
- **Expiry warning and renewal:** 30 minutes before `exp`, a notification appears and refreshes every 5 minutes (`sessionTimeoutConfig` in `lib/jwtUtils.ts`). Clicking "extend session" calls `extendSession()`, which sends `POST /token` **with the current Bearer token instead of Basic credentials**. The frontend then replaces the stored `loginToken` with the new token. If renewal is refused, the frontend logs the user out.
- **Logout:** `logout()` sends `POST /auth/logout` with the token and then clears storage and state. It clears them even if the request fails.

### Session renewal (backend)

When `POST /token` is authenticated with a Bearer token instead of Basic credentials, `TokenController` treats it as a renewal and calls `TokenService.renewToken()`:

1. It reloads the user with `findByUsernameActive(sub)`. If the user has been deleted, renewal is refused.
2. It keeps the current token's lifetime (`exp - iat`). **The `rememberMe` parameter is ignored**, so a 24 h token can't be renewed into a 30-day one.
3. It keeps the original login time in `auth_time`. **A login can't be kept alive for more than 30 days** (`MAX_SESSION_AGE`): renewal is refused after that, and a renewed token's `exp` never goes past `auth_time + 30 days`. Tokens issued before `auth_time` existed use their `iat` instead.
4. It issues a new token with the same claims as a login (`userId`, `scope=ROLE_USER`, a new `jti`).
5. It blacklists the old token's `jti`, so the old token stops working right away.

A refused renewal returns `401 {"error":"Session can no longer be renewed"}`.

### Logout / token revocation (backend)

`AuthController.logout()` decodes the token and passes its `jti` and `exp` to `TokenBlacklistService.blacklistToken()`. The service keeps a `ConcurrentHashMap<jti, expiresAt>`. From then on, `JwtRevocationFilter` rejects that token with `401`, even though its signature and expiry are still valid.

Blacklist entries are needed only until the token would have expired anyway. They are removed when read after expiry, and by an hourly `@Scheduled` cleanup.

## F) Signing keys

| Key         | Where                                                                                                                                         | Used by                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Public key  | `backend/src/main/resources/jwt-keys/app.pub`, committed. `application.yaml` points to it with `jwt.public.key: classpath:./jwt-keys/app.pub` | `JwtDecoder` (verify), `JwtEncoder` (key id) |
| Private key | `JWT_PRIVATE_KEY` environment variable: root `.env` locally, config vars on Heroku. Mapped to `jwt.private.key`                               | `JwtEncoder` (sign)                          |

- The private key must be a PKCS#8 PEM (`-----BEGIN PRIVATE KEY-----`). `SecurityConfig.parsePrivateKey()` accepts real newlines or literal `\n`, so the key can sit on one line in an env var. If the key can't be parsed, startup fails with `JWT_PRIVATE_KEY is not a valid RSA private key`.
- The private key is not in this repository. Get it from the private `backend-credentials` repo. Never commit it or paste it anywhere.
- The two keys must be a matching pair. Otherwise the backend signs tokens it can't verify, and every request after login returns `401 Invalid token`.
- Tests never use the real key. The `test` profile has its own key pair (`application-test.yaml` and `jwt-keys-test/app-public.pem`), and `TokenServiceTest` generates a fresh RSA key for each run. CI (`run-checks-on-pr.yml`) also generates a throwaway `JWT_PRIVATE_KEY` with `openssl genpkey`.

## Things to know

These follow from the design above and are worth knowing when debugging or changing auth:

- **Revocation is in memory only** ([#726](https://github.com/fisma-benefit-app/benefit-app/issues/726)). The blacklist and the login-attempt counters are cleared when the backend restarts. A logged-out or renewed-away token that hasn't expired becomes valid again after a restart or redeploy, and Heroku restarts dynos at least daily. If more than one backend instance ever runs, they won't share the blacklist.
- **Changing the password doesn't revoke existing tokens, and doesn't ask for the current password** ([#725](https://github.com/fisma-benefit-app/benefit-app/issues/725)). Tokens issued before the change stay valid until they expire (24 h, or 30 days with "remember me").
- **Deleting an account works through the database, not the token.** The token keeps passing signature and blacklist checks, but every lookup filters on `deleted_at IS NULL`, so the user's requests fail. For example, `/projects` returns an empty list and profile calls return "not found". Renewal is refused.
- **A login lasts at most 30 days**, however often the session is extended. After that the user has to log in again.
- **Tokens are readable by page JavaScript** (sessionStorage/localStorage), so an XSS bug would expose them. The prod and testing frontends share one GitHub Pages origin, which means they also share storage.
- `/auth/logout` returns `200` with an empty body. Its OpenAPI annotation says `204` ([#729](https://github.com/fisma-benefit-app/benefit-app/issues/729)).

## Testing with Postman

Postman is a tool for testing APIs. You can use it in the browser or as a VS Code extension. This guide uses the VS Code Postman extension.

### Use Postman as an authenticated user

Most endpoints require authentication. This guide uses the local development user `user` defined in `database-seed-dev.sql`. Make sure the application is running in your local development environment (Docker).

#### 1. Click 'New HTTP Request'

Then go to the 'Authorization' tab:

- Select `Basic Auth`
- username: `user`
- password: `user`

#### 2. At the top, select:

- Method: `POST`
- URL: `http://localhost:8080/token` (add `?rememberMe=true` for a 30-day token)

Press `Send`.

#### 3. At the bottom, it should show 'Status: 200 OK', and 'Body' should contain JSON

Example JSON, with the token shortened:

```json
{ "token": "eyJraWQiOi...", "tokenType": "Bearer", "expiresIn": 86400 }
```

To see the claims, paste the token into a JWT decoder, or Base64-decode the middle part yourself.

#### 4. Copy the raw JWT (the `token` value, without the quotation marks)

#### 5. On the Authorization tab, change the 'type' to `Bearer Token` and paste the raw token

#### 6. Test whether you're authenticated

- Method: `GET`
- URL: `http://localhost:8080/projects`

The 'Body' tab should now show a JSON response with the user's projects.

If no JSON is visible (a Postman display bug), switch to the 'Cookies' tab and then back to 'Body'.

#### 7. Optional: test renewal and logout

- **Renewal:** send `POST http://localhost:8080/token?rememberMe=true` with the Bearer token instead of Basic Auth. You get a new token with `"expiresIn": 86400`, because renewal keeps the current lifetime. Repeating step 6 with the **old** token now gives `401 {"error": "Token has been revoked"}`.
- **Logout:** send `POST http://localhost:8080/auth/logout` with a Bearer token, then repeat step 6 with it. You should get `401 {"error": "Token has been revoked"}`.
