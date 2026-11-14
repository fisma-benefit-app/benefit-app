# Authentication and Authorization Guide

This guide explains how Benefit logs users in and keeps them logged in. It follows a login token (JWT) through the whole system:

- **Database → API → browser:** a username and password row in `app_users` becomes a signed JWT.
- **Browser → API → database:** each later request carries that JWT, and the backend uses it to find the user's data again.

The [November 2026 audit](../archive/security_audit_2026-11-05.md) identified a
Bearer-scheme casing bypass ([#985](https://github.com/fisma-benefit-app/benefit-app/issues/985)),
now covered by shared token resolution and regression tests.
Password changes invalidate every session, including the current one, through
durable per-account session versions ([#979](https://github.com/fisma-benefit-app/benefit-app/issues/979)).
Use the [audit guide](security_audit.md) for controlled validation of deployed revisions.

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
    FE->>FE: store in localStorage

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
    session_version BIGINT NOT NULL DEFAULT 0 CHECK (session_version >= 0),
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
| `api/AppUserController.java` / `service/AppUserService.java` | Get your own user, change your password (stored as a new BCrypt hash), and soft-delete your own account. Password changes use `PUT /appusers/password` with `currentPassword` and `newPassword`. There is no profile-update or username-change endpoint (see [D.3](#3-controllers-turn-the-token-back-into-database-rows)). |

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

This is standard HTTP Basic auth: `username:password` encoded in Base64. Base64 is an encoding, not encryption, so anyone who can read the request can read the password. It is protected only by the connection being HTTPS, and the app does no encryption of its own: the backend has no TLS, HSTS or HTTPS-redirect settings.

| Environment                                    | Connection | Notes                                                                                                                                                                                                               |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production (Heroku), testing (Scalingo)        | HTTPS      | The platforms terminate TLS. The frontend on GitHub Pages is HTTPS too, so the browser would block calls to a plain-HTTP API as mixed content.                                                                      |
| Self-hosted stack (`docker-compose.prod.yaml`) | **HTTP**   | nginx only listens on port 80, so the password and every JWT cross the network unencrypted. Put a TLS reverse proxy (e.g. Caddy) in front before real users log in, see [deployment_guide.md](deployment_guide.md). |
| Local development                              | HTTP       | `localhost` only.                                                                                                                                                                                                   |

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
| `session_version` | account session version | copied with the password hash during Basic authentication; preserved during renewal |
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
  "session_version": 0,
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

They always go into `localStorage` through `authStorage` (`lib/authStorage.ts`), so every tab shares the login and logging out in one tab logs out the others. "Remember me" only changes the token's lifetime, not where it is stored. Without it the login is not cleared when the browser closes, but the token still stops working after 24 hours. Keys are prefixed with the deployment's base path (`import.meta.env.BASE_URL`) to avoid accidental login-key collisions (#679). This is not a security boundary: scripts on the same origin can read other prefixes too. The same values are put into React state through `AppUserContext` (`context/AppUserProvider.tsx`).

## D) Token → database: authenticated requests

### 1. The frontend attaches the token

Every API wrapper in `api/` (`project.ts`, `comments.ts`, `profile.ts`, …) sends the stored string as-is:

```ts
const headers = { Authorization: sessionToken }; // "Bearer eyJ..."
```

### 2. The backend verifies it

Two filters check a Bearer token, in this order:

Authentication, revocation and logout share Spring's `DefaultBearerTokenResolver`
from `SecurityConfig`. It accepts the Authorization header with case-insensitive
Bearer schemes (`Bearer`, `bearer`, `BEARER`, mixed case); query and form tokens
remain disabled. Every accepted casing receives the same revocation checks.
Malformed Bearer headers are rejected with `401 {"error":"Invalid token"}`.

1. **`JwtRevocationFilter`** is registered in `SecurityConfig` before `SecurityContextHolderFilter`. `FilterRegistrationConfig` stops the servlet container from also registering it globally, so it runs once. The filter decodes the token with the `JwtDecoder`, which checks the signature and expiry. It then rejects the request with `401` if:
   - decoding fails (bad signature, expired, malformed): `{"error":"Invalid token"}`
   - the token has no `jti`, or its `jti` is on the blacklist: `{"error": "Token has been revoked"}`
2. **Spring's `BearerTokenAuthenticationFilter`**, enabled by `.oauth2ResourceServer(oauth2 -> oauth2.jwt(...))`, decodes the token again with the same `JwtDecoder`. The decoder is `NimbusJwtDecoder` built from the public key. Its `AccountSessionValidator` also rejects tokens for missing/deleted accounts or whose `session_version` differs from the database. This check applies to every accepted Bearer spelling, including renewal. The filter builds a `JwtAuthenticationToken`:
   - `getName()` returns the `sub` claim, i.e. the username
   - authorities come from `scope`, prefixed with `SCOPE_`, so they become `SCOPE_ROLE_USER`

Spring HTTP sessions are `STATELESS`; authenticated request state is not kept in
an HTTP session. Revoked JWT IDs are nevertheless persisted in the database.

### 3. Controllers turn the token back into database rows

Controllers take an `Authentication` parameter and pass `authentication.getName()` (the username) to the service layer. The username then becomes the filter in the database queries:

- **Projects:** `ProjectRepository.findAllByUsernameActive()` and `findByProjectIdAndUsernameActive()` join `projects → projects_app_users → app_users` and filter on `u.username = :username AND u.deleted_at IS NULL`. A user can only reach projects they are linked to, and a request for any other project id gets "not found".
- **Users/profile:** `AppUserService.getUserFromAuthentication()` calls `findByUsernameActive(authentication.getName())` and then compares ids. For example, users can only delete their own account.
- **Comments and functional components** follow the same pattern through their services.

**The username in `sub` is the lookup key on the backend. The `userId` claim is used only by the frontend.** No backend code reads `userId` from the token.

This is why **usernames can't be changed.** If a user could rename themselves, their old name would become free while tokens issued under it stayed valid. Whoever took that name next could then be reached with those old tokens. No API supports changing the username.

Only the unauthenticated paths skip all of this: `/actuator/health`, the OpenAPI/Swagger paths, and CORS preflight `OPTIONS` requests. All other requests need a valid token (`anyRequest().authenticated()`).

## E) Session lifecycle in the frontend

All of this lives in `context/AppUserProvider.tsx`.

- **Page reload:** `restoreSession()` reads `loginToken`, `userInfo` and `userId` from localStorage. It calls `GET /auth/validateJWT`, a dummy endpoint that returns `200` only if the token passes the checks in [D.2](#2-the-backend-verifies-it). On `401` the stored session is cleared. On a network error the session is kept.
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

The decoder and renewal service both compare the presented `session_version` with
that account's database row. Renewal never upgrades a stale session to the new
version. A password change after renewal reads the row makes the resulting token
stale too.

A refused renewal returns `401 {"error":"Session can no longer be renewed"}`.

### Password changes and every-session invalidation

`PUT /appusers/password` locks the active account row before checking the current
password. A successful change updates the BCrypt hash and increments
`app_users.session_version` in one transaction. Rejected changes and rolled-back
transactions preserve both. All earlier JWTs, including the caller's, then fail
protected requests and renewal. The check reads the database, so invalidation
survives restarts and works across instances sharing it. An already authenticated
request may finish; this does not cancel requests that were already in flight.

Login copies the session version alongside the password hash into `AppUserDetails`
and signs that snapshot. If a password change races credential checking or token
signing, the old credential snapshot can only produce a stale token. Renewal also
signs the version it checked, rather than fetching a newer version when signing.
Concurrent password changes serialize on the account row and recheck the session
version under the lock, even when the password is changed to the same value.

Before submission the password form explains that every device will be signed
out. While saving it disables the submit button. After success the frontend
clears shared browser storage/state and redirects to login with a persistent
confirmation that the password was updated and the user must sign in again. Other tabs share the cleared storage; other devices lose access on their
next authenticated interaction. Their remote UI is not cleared instantaneously.

#### Deployment compatibility and rollback

Apply `2026_11_14_app_users_session_version.sql` manually before deploying the new
backend (the self-hosted updater applies migrations as documented in
[database.md](database.md)). The migration adds a non-null version with default
zero; it neither seeds nor changes existing passwords. JWTs without the claim are
explicitly treated as version zero, so existing sessions survive deployment until
the account's first password change. Malformed version claims are rejected.

Stop/drain old backend instances before routing traffic to this release. Old
code does not enforce or increment the version and therefore cannot safely serve
alongside the new code once password changes resume. Keep the column and its
values on rollback: rolling back the backend removes the guarantee and may make
previously invalidated tokens usable again. If rollback is necessary, stop traffic
and rotate the environment's JWT signing key before reopening it to force fresh
logins. Do not reset/drop the version while any previously issued JWT can remain
valid; doing so can revive old sessions. Shared `spring.sql.init.mode` stays
`never`; hosted databases are never reseeded automatically.

### Logout / token revocation (backend)

`AuthController.logout()` decodes the token and passes its `jti` and `exp` to `TokenBlacklistService.blacklistToken()`. The service persists a `RevokedToken` through `RevokedTokenRepository` in PostgreSQL's `revoked_tokens` table. Requests using that JWT then receive `401` from `JwtRevocationFilter` for every accepted scheme casing, even while signature/expiry remain valid. This also prevents renewal through `POST /token`.

Blacklist checks query for an entry whose expiry is still in the future. Expired rows are deleted by an hourly `@Scheduled` cleanup. Deployment must apply the revocation-table migration; code alone does not verify a hosted database's schema.

## F) Signing keys

| Key         | Where                                                                                                           | Used by                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Private key | `JWT_PRIVATE_KEY` environment variable: root `.env` locally, config vars on Heroku, Environment tab on Scalingo. Mapped to `jwt.private.key` | `JwtEncoder` (sign)                          |
| Public key  | Derived from the private key at startup (`SecurityConfig.publicKey()`). Not stored anywhere                     | `JwtDecoder` (verify), `JwtEncoder` (key id) |

- The private key must be a PKCS#8 PEM (`-----BEGIN PRIVATE KEY-----`). `SecurityConfig.parsePrivateKey()` accepts real newlines or literal `\n`, so the key can sit on one line in an env var. If the key can't be parsed, startup fails with `JWT_PRIVATE_KEY is not a valid RSA private key`.
- Deployed environments' keys are not in this repository. Never commit them or paste them anywhere.
- The `dev` profile has a public, dev-only key (`jwt.dev-private-key` in `application-dev.yaml`), used when `JWT_PRIVATE_KEY` is empty. Outside `dev`, the backend refuses to start with it (`SecurityConfig.DEV_KEY_FINGERPRINT`). If you replace the dev key, update the fingerprint too.
- **Every environment must have its own key.** A backend accepts any token signed with its key, so a shared key lets a token from testing log in to production (#679). Never copy a key from one environment to another. Generate a new one with `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`.
- Changing an environment's key logs out everyone on that environment once.
- Tests never use the real key. The `test` profile has its own key in `application-test.yaml`, and `TokenServiceTest` and `JwtSigningKeyTest` generate fresh RSA keys for each run. CI (`run-checks-on-pr.yml`) also generates a throwaway `JWT_PRIVATE_KEY` with `openssl genpkey`.

## Things to know

These follow from the design above and are worth knowing when debugging or changing auth:

- **Revocation is database-backed.** Instances using the same database share persisted revoked-token rows; rejection survived backend recreation in the local audit. Integration tests cover logout, protected requests and revoked-token renewal across accepted scheme casings. Hosted schema/configuration and deployed revisions still need verification. Login-attempt counters remain in memory and reset on restart; they are not shared across instances.
- **Password changes require the current password** ([#974](https://github.com/fisma-benefit-app/benefit-app/issues/974)). `PUT /appusers/password` accepts `currentPassword` and `newPassword`. The unused `PUT /appusers/{id}` route has been removed. Missing current passwords are rejected with `400` and incorrect ones with `403`, without changing the password. A successful change invalidates every existing session, including the current one, through the durable session version (#979); the user must sign in again.
- **Deleting an account works through the database, not the token.** `AccountSessionValidator` requires an active account, so an existing JWT is rejected on protected requests and renewal after deletion. Resource lookups also filter on `deleted_at IS NULL`.
- **A login lasts at most 30 days**, however often the session is extended. After that the user has to log in again.
- **Tokens are readable by page JavaScript** (localStorage), so an XSS bug would expose them. The prod and testing frontends share one GitHub Pages origin and so share localStorage, which is why the keys are prefixed with the base path.
- **Credentials are only as private as the connection.** Basic auth and Bearer tokens are not encrypted by the app, so HTTPS is required ([#528](https://github.com/fisma-benefit-app/benefit-app/issues/528)). Heroku and Scalingo provide it. The self-hosted stack doesn't yet.
- `/auth/logout` declares `204 No Content` through `@ResponseStatus`; verify actual status and revocation behavior against the assessed revision rather than inferring success from an empty response.

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

To inspect claims, decode the payload locally with a trusted offline tool. Do not paste live JWTs into external decoder websites, issues or chat. Decoding claims does not verify the signature.

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
