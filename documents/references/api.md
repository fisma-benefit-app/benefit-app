# Benefit API reference

Use this API to manage FiSMA calculations, project versions, shared access, and comments. Requests and responses use JSON unless an endpoint says otherwise.

The [OpenAPI specification](api-docs.yaml) contains the machine-readable contract. This guide adds working examples and the rules clients need to understand. See [maintaining this reference](../guides/generate_api_docs.md) when changing the API.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Get started](#get-started)
- [Concepts and conventions](#concepts-and-conventions)
- [Authentication and sessions](#authentication-and-sessions)
- [Projects](#projects)
- [Project membership](#project-membership)
- [Functional components](#functional-components)
- [Comments](#comments)
- [User accounts](#user-accounts)
- [Field reference](#field-reference)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Get started

The examples below use a local backend at `http://localhost:8080`. Start it with the repository's [development setup](../../README.md#setting-up-development-environment). Use your deployed backend's HTTPS URL when working outside local development.

### Sign in and fetch projects

Set the base URL and your username. The seeded local development account is `user` / `user`; deployed accounts use their own credentials.

```bash
export BENEFIT_API_URL='http://localhost:8080'
export BENEFIT_USERNAME='user'

curl --request POST \
  --url "$BENEFIT_API_URL/token" \
  --user "$BENEFIT_USERNAME" \
  --header 'X-Benefit-Login: 1'
```

cURL prompts for the password. A successful response includes a JWT in its `token` field and in the `Authorization` response header:

```json
{
  "token": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

`<JWT>` stands for the token returned by your backend. Copy just that value, without the `Bearer ` prefix, into the variable below:

```bash
export BENEFIT_TOKEN='paste-your-token-here'

curl --request GET \
  --url "$BENEFIT_API_URL/projects" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

You receive an array of projects accessible to your account. An account with no projects receives `[]`.

### Create and retrieve a project

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"projectName":"My first calculation","version":1,"functionalComponents":[]}'
```

Success is `201 Created` with a `Location` header and no body. Copy the new project's numeric ID from that URL, then fetch it:

```bash
export PROJECT_ID=7

curl --request GET \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

Replace `7` with the ID you received. Keep the returned `version`, `lockVersion`, and existing field values when [updating the project](#update-a-project). If creating a project returns `409`, choose a name you do not already have access to.

## Concepts and conventions

### Requests, examples, and IDs

All protected requests send `Authorization: Bearer <token>`. Requests with a JSON body also send `Content-Type: application/json`. Basic credentials are accepted only for signing in at `POST /token` with `X-Benefit-Login: 1`.

Endpoint examples assume the variables from the quickstart. Set `PROJECT_ID`, `COMPONENT_ID`, `COMMENT_ID`, or `APP_USER_ID` to the resource you actually intend to use. Response examples are snapshots of disposable local data; their IDs and timestamps are illustrative, not IDs to copy into another database. Replace request values with your own data. Endpoints returning `204` have no response body; do not try to parse them as JSON.

The `role` of an account (`USER` or `ADMIN`) and its `roleInProject` (`OWNER` or `MEMBER`) are different. An administrator can create user accounts; administration does not bypass the project ownership checks.

### Project versions and lockVersion

Projects with the same backend-assigned `familyId` belong to the same version history. Display names do not establish identity; independently created and duplicated projects start separate families. The highest `version` is the latest; older versions can be read but cannot be edited. A new project version has its own project ID.

`version` is the calculation's version number. `lockVersion` is a separate save counter that protects against concurrent edits:

1. Fetch a project with `GET /projects/{id}` and retain its current `lockVersion`.
2. Send that value unchanged in `PUT /projects/{id}` with your edit.
3. Keep the new `lockVersion` returned after a successful save.

If another request saves first, your old counter is rejected with `409` and `STALE_LOCK_VERSION`. Fetch the current state, compare changes, and reapply your edit deliberately. Merely replacing the counter in an old request can overwrite someone else's work. Component creation and deletion also advance the project's save counter, so fetch fresh project state after those operations.

**A project update is a full update, not a partial patch.** Omitted report fields and dates become `null`. Preserve the complete component tree, including subcomponents, when saving an existing calculation. Sending only the one field you changed is not sufficient.

### Owners, members, and comments

An `OWNER` can edit the latest calculation, create versions, duplicate or delete a project, and manage membership. A `MEMBER` has view-only access to calculation data. Both roles can read, create, update, and delete comments on accessible projects, including archived versions. Comments are tied to a particular project ID, not the entire version history, and comment edits are not limited to their author.

Sharing and removing access apply across the project's existing versions. New versions copy membership and roles. A duplicate starts a separate project at version 1, owned only by the caller.

### Sessions and session_version

A normal sign-in produces a 24-hour token. `rememberMe=true` produces a 30-day token. The client must send the token on later requests; the API does not use a login cookie.

Renewal at `POST /token` uses a Bearer token instead of Basic credentials. It keeps the original token lifetime and revokes the token being replaced. Replace the old token everywhere your client stores it. Renewal cannot extend a login past 30 days from its original `auth_time`, even if you keep renewing it.

`session_version` is an internal account-session counter, stored in the database and included in JWTs. A successful password change increments it. Every existing token then carries an old value and is rejected, including the token used to change the password. **Sign in again after changing a password.** Clients do not send, increment, or edit this claim themselves.

`jti` identifies one token for renewal and logout revocation. Logout revokes that token; a password change invalidates all existing sessions for the account. Deleting an account also makes its existing tokens unusable. See the [authentication guide](../guides/authentication.md) for implementation details.

### Component ordering, version links, and MLA

`orderPosition` controls display order. `previousFCId` links a copied component to its counterpart in the previous project version so reports can compare them; it is not an ordering field. Components without a predecessor use `null`.

Multi-layer architecture (MLA) uses a parent's `subComponents` and each child's `parentFCId`. A child's `subComponentType` identifies its layer: `presentation`, `businessLogic`, `dataAccess`, or `integration`. `isReadonly` describes the child's editing behavior in the calculation; it is unrelated to a user's project permissions.

When creating a version, the backend copies active components, sets their `previousFCId`, and remaps parent/child IDs. Use the new component IDs returned by the new version rather than reusing the old IDs.

### Conflicts and recovery

Validation and service permission errors usually return text. Conflict responses return JSON:

```json
{
  "code": "STALE_LOCK_VERSION",
  "message": "The project was changed by someone else. Reload it and try again."
}
```

| Code | Meaning | Recovery |
| --- | --- | --- |
| `STALE_LOCK_VERSION` | The project changed since the state you edited, or during your save. | Fetch the current state, compare, and reapply your changes with its current `lockVersion`. |
| `NOT_LATEST_VERSION` | You tried to change an archived version. | Open the latest version; changing the request's `version` field cannot make this project editable. |
| `PROJECT_NAME_ALREADY_EXISTS` | You already have access to a project with the requested creation name. | Choose another name, or use the existing project. |
| `USERNAME_ALREADY_EXISTS` | The account username is already taken. | Choose another username. |
| `ALREADY_MEMBER` | The user already has access to the project. | Keep the existing membership. |
| `LAST_MEMBER` | Removal would leave no other active member. | Keep a member, or delete the project if that is your intent. |

A `401` indicates an unusable session; sign in again. A `403` indicates insufficient permission or, for password changes, an incorrect current password. A `404` can mean that a project is unavailable to your account as well as that it does not exist. Do not assume a `404` reveals whether another user's project exists.

## Authentication and sessions

### Sign in or renew a session

`POST /token`

Exchange credentials for a JWT, or replace an existing JWT while preserving the session lifetime. The same endpoint serves both operations.

#### Authentication and permissions

For sign-in, use Basic credentials plus `X-Benefit-Login: 1`. For renewal, use a valid Bearer token. Do not send both credential schemes.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `rememberMe` | query | No | Boolean; defaults to `false`. Selects a 30-day token on sign-in; ignored during renewal. |
| `X-Benefit-Login` | header | For Basic sign-in | Must be `1`. Not required for Bearer renewal. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/token" \
  --user "$BENEFIT_USERNAME" \
  --header 'X-Benefit-Login: 1'
```

#### Successful response

`200 OK`

```json
{
  "token": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

The token is also returned in `Authorization: Bearer <JWT>`. `expiresIn` is in seconds. `<JWT>` is intentionally a placeholder; published examples never include a usable token.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | Invalid credentials, invalid token, or the login can no longer be renewed. | Sign in with valid credentials. |
| `403` | The Basic sign-in header is missing or the origin is rejected. | Send `X-Benefit-Login: 1`; check the browser origin configuration. |
| `429` | Too many failed sign-in attempts. | Stop retrying immediately and wait before trying again. |
| `500` | Token issuance failed. | Retry later; investigate backend logs if it persists. |

#### Renew an existing session

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/token" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

A successful renewal has the same response shape as sign-in. Replace `BENEFIT_TOKEN` with the returned token. The old token immediately becomes unusable. To sign in with a 30-day lifetime, use `/token?rememberMe=true` with Basic credentials instead.

### Validate a session

`GET /auth/validateJWT`

Check whether the current Bearer token is accepted. This is useful when restoring a saved login.

#### Authentication and permissions

Bearer JWT; any active account.

#### Parameters

No path, query, or body parameters.

#### Request example

```bash
curl --include --request GET \
  --url "$BENEFIT_API_URL/auth/validateJWT" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

No response body.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |

### Sign out

`POST /auth/logout`

Revoke the presented JWT. It can no longer authenticate requests or renew the session.

#### Authentication and permissions

Bearer JWT; any active account.

#### Parameters

No path, query, or body parameters.

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/auth/logout" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

Remove the token from client storage after signing out.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |

## Projects

### List your projects

`GET /projects`

Return projects accessible to the authenticated user, including archived versions. There are no pagination or filter parameters.

#### Authentication and permissions

Bearer JWT; both owners and members see their accessible projects.

#### Parameters

No path, query, or body parameters.

#### Request example

```bash
curl --include --request GET \
  --url "$BENEFIT_API_URL/projects" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

```json
[
  {
    "id": 11,
    "projectName": "Benefit documentation example",
    "version": 1,
    "createdAt": "2026-11-18T17:06:23",
    "versionCreatedAt": "2026-11-18T17:06:23",
    "calculationDate": "2026-11-18",
    "reportContactDetails": "Benefit team",
    "reportNotes": "Initial review.",
    "updatedAt": "2026-11-18T17:06:23",
    "lockVersion": 0,
    "active": true,
    "functionalComponents": [],
    "projectAppUsers": [
      {
        "id": 21,
        "roleInProject": "OWNER",
        "appUser": {
          "id": 11,
          "username": "docs_owner"
        }
      }
    ]
  }
]
```

The response is an array of [ProjectResponse](#projectresponse). An account with no accessible projects receives `[]`.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |

### Get a project

`GET /projects/{id}`

Fetch a project, its active component tree, membership, and current save counter. Use this response as the starting point for an edit.

#### Authentication and permissions

Bearer JWT. You must have access to the project; both **OWNER** and **MEMBER** can use this endpoint.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID. |

#### Request example

```bash
curl --include --request GET \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

```json
{
  "id": 11,
  "projectName": "Benefit documentation example",
  "version": 1,
  "createdAt": "2026-11-18T17:06:23",
  "versionCreatedAt": "2026-11-18T17:06:23",
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Initial review.",
  "updatedAt": "2026-11-18T17:06:23",
  "lockVersion": 0,
  "active": true,
  "functionalComponents": [],
  "projectAppUsers": [
    {
      "id": 21,
      "roleInProject": "OWNER",
      "appUser": {
        "id": 11,
        "username": "docs_owner"
      }
    }
  ]
}
```

Returns [ProjectResponse](#projectresponse). A returned archived version can be read but not edited.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |

### Create a project

`POST /projects`

Create a new calculation. The caller becomes its owner. A name already accessible to the caller cannot be reused for another new project.

#### Authentication and permissions

Bearer JWT; any active account.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectName` | JSON body | Yes | Nonblank name, at most 255 characters. |
| `version` | JSON body | Yes | Use `1` for a new calculation. |
| Other fields | JSON body | No | See [ProjectRequest](#projectrequest); `lockVersion` is not needed for creation. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "projectName": "Benefit documentation example",
  "version": 1,
  "functionalComponents": [],
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Initial review."
}'
```

#### Successful response

`201 Created`

```http
Location: http://localhost:8080/projects/11
```

The response has no body. Follow `Location` with an authenticated GET to retrieve the resource.

Unlike update and duplicate, creation does not return a project body.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `409` | You already have access to a project with this name. | Choose a new name; see `PROJECT_NAME_ALREADY_EXISTS`. |

### Update a project

`PUT /projects/{id}`

Save changes to the latest version. Fetch the current project first, preserve its existing values, and send its current `lockVersion`. Renaming also renames its archived versions.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID. |
| `projectName` | JSON body | Yes | Current name, unless intentionally renaming. |
| `version` | JSON body | Yes | Keep the existing value unchanged. |
| `lockVersion` | JSON body | Yes | Counter from the project response you edited. |
| Remaining fields | JSON body | Preserve existing values | Complete calculation and report fields; see [ProjectRequest](#projectrequest). |

#### Request example

```bash
curl --include --request PUT \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "projectName": "Benefit documentation example",
  "version": 1,
  "functionalComponents": [],
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Reviewed with the project owner.",
  "lockVersion": 0
}'
```

#### Successful response

`200 OK`

```json
{
  "id": 11,
  "projectName": "Benefit documentation example",
  "version": 1,
  "createdAt": "2026-11-18T17:06:23",
  "versionCreatedAt": "2026-11-18T17:06:23",
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Reviewed with the project owner.",
  "updatedAt": "2026-11-18T17:06:22",
  "lockVersion": 1,
  "active": true,
  "functionalComponents": [],
  "projectAppUsers": [
    {
      "id": 21,
      "roleInProject": "OWNER",
      "appUser": {
        "id": 11,
        "username": "docs_owner"
      }
    }
  ]
}
```

The example updates a note on a project with no components. Keep your own component tree when editing an existing calculation. The returned `lockVersion` is the counter to use for the next edit.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | Project or a referenced component is unavailable. | Check project access and component IDs. |
| `409` | The project is archived or changed during the request. | Read the conflict `code`; see [conflict recovery](#conflicts-and-recovery). |

#### Recover from a stale save

```json
{
  "code": "STALE_LOCK_VERSION",
  "message": "The project was changed by someone else. Reload it and try again."
}
```

Fetch the current project, compare it with your edit, and reapply the changes you still want. Retry with the new state and its counter. If the code is `NOT_LATEST_VERSION`, open the latest project version instead.

Omitting `lockVersion` returns `400` with this text body:

```text
lockVersion is required when updating a project
```

### Create a new project version

`POST /projects/{id}/versions`

Create a new project row and copy the source version's active components, memberships, and roles. The previous project becomes archived once a higher version exists.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`. The source must also be the latest version.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Source project ID. |
| `projectName` | JSON body | Yes | Required by request validation; the backend retains the source project name. |
| `version` | JSON body | Yes | Required by request validation; the backend selects the source version plus one. |
| Report/date fields | JSON body | No | Values for the new version; preserve source values you want to keep. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/versions" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "projectName": "Benefit documentation example",
  "version": 2,
  "functionalComponents": [],
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Initial review."
}'
```

#### Successful response

`201 Created`

```http
Location: http://localhost:8080/projects/13
```

The response has no body. Follow `Location` with an authenticated GET to retrieve the resource.

Follow `Location` and use the new project ID for edits. Components are copied from the server-side source; a submitted `functionalComponents` array does not replace that copy. The new component IDs link back through `previousFCId`.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |
| `409` | The source is no longer the latest version. | Fetch the latest version and create the next version from it. |

### Duplicate a project

`POST /projects/{id}/duplicate`

Copy an owned project and its active component tree into a separate calculation at version 1. The backend picks a free name such as `Benefit documentation example - Copy`. Only the caller owns the new project.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID to duplicate. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/duplicate" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

```json
{
  "id": 12,
  "projectName": "Benefit documentation example - Copy",
  "version": 1,
  "createdAt": "2026-11-18T17:06:23",
  "versionCreatedAt": "2026-11-18T17:06:23",
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Reviewed with the project owner.",
  "updatedAt": "2026-11-18T17:06:23",
  "lockVersion": 0,
  "active": true,
  "functionalComponents": [],
  "projectAppUsers": [
    {
      "id": 23,
      "roleInProject": "OWNER",
      "appUser": {
        "id": 11,
        "username": "docs_owner"
      }
    }
  ]
}
```

Returns the new [ProjectResponse](#projectresponse) directly. This is a separate calculation, not the next version of the source.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |

### Delete a project

`DELETE /projects/{id}`

Soft-delete the specified project and its active components. This affects that project ID, not every row sharing its name.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID to delete. |

#### Request example

```bash
curl --include --request DELETE \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |

## Project membership

### Add a project member

`POST /projects/{id}/users`

Give an existing account view-only access to the project and its existing versions. Membership in new versions is copied from the source version.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID. |
| `username` | JSON body | Yes | Nonblank username of an active account. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/users" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "username": "docs_member"
}'
```

#### Successful response

`200 OK`

```json
{
  "id": 11,
  "projectName": "Benefit documentation example",
  "version": 1,
  "createdAt": "2026-11-18T17:06:23",
  "versionCreatedAt": "2026-11-18T17:06:23",
  "calculationDate": "2026-11-18",
  "reportContactDetails": "Benefit team",
  "reportNotes": "Reviewed with the project owner.",
  "updatedAt": "2026-11-18T17:06:23",
  "lockVersion": 1,
  "active": true,
  "functionalComponents": [],
  "projectAppUsers": [
    {
      "id": 21,
      "roleInProject": "OWNER",
      "appUser": {
        "id": 11,
        "username": "docs_owner"
      }
    },
    {
      "id": 22,
      "roleInProject": "MEMBER",
      "appUser": {
        "id": 12,
        "username": "docs_member"
      }
    }
  ]
}
```

The added user has `roleInProject: "MEMBER"`. This endpoint cannot grant ownership.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | The project or active user is unavailable. | Check access and the username. |
| `409` | The user is already a member. | Keep the existing membership; see `ALREADY_MEMBER`. |

### Remove a project member

`DELETE /projects/{id}/users/{appUserId}`

Remove a user's access across the project's existing versions. Project data remains available to the remaining members.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Project ID. |
| `appUserId` | path | Yes | Account ID, not the project-user relationship ID. |

#### Request example

```bash
curl --include --request DELETE \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/users/$APP_USER_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

An owner can remove their own membership if another active member remains. A remaining view-only member is not automatically promoted to owner.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | Project is unavailable or the account is not a member. | Check both IDs. |
| `409` | No other active member would remain. | Keep a member or delete the project; see `LAST_MEMBER`. |

## Functional components

### Create a functional component

`POST /functional-components/projects/{projectId}`

Add a component to the latest project version. The backend appends it and normalizes component ordering, even though the request must include `orderPosition`.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`. The project must be the latest version.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectId` | path | Yes | Project ID. |
| `orderPosition` | JSON body | Yes | Nonnegative integer; final position is assigned by the backend. |
| `isMLA` | JSON body | Yes | Whether this component participates in the MLA hierarchy. |
| Other fields | JSON body | See schema | See [FunctionalComponentRequest](#functionalcomponentrequest); `isReadonly` defaults to `false`. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/functional-components/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "title": "Register a customer",
  "className": "Interactive end-user input service",
  "componentType": "Interactive",
  "dataElements": 5,
  "readingReferences": 1,
  "writingReferences": 1,
  "degreeOfCompletion": 0.0,
  "orderPosition": 0,
  "isMLA": false,
  "isReadonly": false
}'
```

#### Successful response

`200 OK`

Selected fields from the returned [ProjectResponse](#projectresponse); timestamps and report fields are omitted from this example.

```json
{
  "id": 11,
  "projectName": "Benefit documentation example",
  "version": 1,
  "lockVersion": 2,
  "functionalComponents": [
    {
      "id": 9301,
      "title": "Register a customer",
      "description": null,
      "className": "Interactive end-user input service",
      "componentType": "Interactive",
      "dataElements": 5,
      "readingReferences": 1,
      "writingReferences": 1,
      "functionalMultiplier": null,
      "operations": null,
      "degreeOfCompletion": 0.0,
      "previousFCId": null,
      "orderPosition": 0,
      "isMLA": false,
      "parentFCId": null,
      "subComponentType": null,
      "isReadonly": false,
      "subComponents": null
    }
  ],
  "projectAppUsers": [
    {
      "id": 21,
      "roleInProject": "OWNER",
      "appUser": {
        "id": 11,
        "username": "docs_owner"
      }
    }
  ]
}
```

Returns the whole updated [ProjectResponse](#projectresponse), not just the new component. Keep its new `lockVersion`. If you supply `parentFCId`, that parent must be active in the same project.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | Project or parent component is unavailable. | Check access and the parent ID. |
| `409` | The project is archived or changed during the request. | Read the conflict `code`; see [conflict recovery](#conflicts-and-recovery). |

### Delete a functional component

`DELETE /functional-components/{componentId}/projects/{projectId}`

Soft-delete a component and its subcomponents from the latest project version. The remaining display positions are normalized.

#### Authentication and permissions

Bearer JWT. You must be an **OWNER** of this project. A view-only member receives `403`. The project must be the latest version.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `componentId` | path | Yes | Component ID in the specified project. |
| `projectId` | path | Yes | Project ID. |

#### Request example

```bash
curl --include --request DELETE \
  --url "$BENEFIT_API_URL/functional-components/$COMPONENT_ID/projects/$PROJECT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

Fetch the project again before the next full update: deletion advances `lockVersion` but this response has no body.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | You are a member, but not a project owner. | Ask an owner to make the change. |
| `404` | Project or active component is unavailable. | Check project access and that the component belongs to this project. |
| `409` | The project is archived or changed during the request. | Read the conflict `code`; see [conflict recovery](#conflicts-and-recovery). |

## Comments

### List project comments

`GET /projects/{projectId}/comments`

Return comments attached to one project version. Comments on other project IDs are not included.

#### Authentication and permissions

Bearer JWT. You must have access to the project; both **OWNER** and **MEMBER** can use this endpoint.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectId` | path | Yes | Project ID. |

#### Request example

```bash
curl --include --request GET \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/comments" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

```json
[
  {
    "id": 8,
    "text": "Reading references confirmed.",
    "projectId": 11
  }
]
```

Returns an array of [CommentResponse](#commentresponse). The array is empty when there are no comments.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |

### Create a comment

`POST /projects/{projectId}/comments`

Add a comment to the specified project version, including an archived version.

#### Authentication and permissions

Bearer JWT. You must have access to the project; both **OWNER** and **MEMBER** can use this endpoint.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectId` | path | Yes | Project ID. |
| `text` | JSON body | Yes | Nonblank text, at most 2,000 characters. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/comments" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "Please confirm the reading references."
}'
```

#### Successful response

`201 Created`

```http
Location: http://localhost:8080/projects/11/comments/8
```

The response has no body. Use the ID in `Location` for update/delete, or list the project's comments to retrieve it.

To retrieve it, list the project's comments. There is no single-comment GET endpoint; `Location` identifies the created comment for update and delete operations.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `404` | The project is missing or unavailable to your account. | Check the ID and project access. |

### Update a comment

`PUT /projects/{projectId}/comments/{commentId}`

Replace the text of a comment attached to this project. Any account with project access can update it; the API does not restrict edits to the author.

#### Authentication and permissions

Bearer JWT. You must have access to the project; both **OWNER** and **MEMBER** can use this endpoint.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectId` | path | Yes | Project ID. |
| `commentId` | path | Yes | Comment ID belonging to that project. |
| `text` | JSON body | Yes | Nonblank replacement text, at most 2,000 characters. |

#### Request example

```bash
curl --include --request PUT \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/comments/$COMMENT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "Reading references confirmed."
}'
```

#### Successful response

`200 OK`

```json
{
  "id": 8,
  "text": "Reading references confirmed.",
  "projectId": 11
}
```

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The comment belongs to a different project. | Use its actual project ID. |
| `404` | Project or comment is unavailable. | Check access and both IDs. |

### Delete a comment

`DELETE /projects/{projectId}/comments/{commentId}`

Permanently remove a comment. Unlike projects and functional components, this operation does not soft-delete it.

#### Authentication and permissions

Bearer JWT. You must have access to the project; both **OWNER** and **MEMBER** can use this endpoint.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `projectId` | path | Yes | Project ID. |
| `commentId` | path | Yes | Comment ID belonging to that project. |

#### Request example

```bash
curl --include --request DELETE \
  --url "$BENEFIT_API_URL/projects/$PROJECT_ID/comments/$COMMENT_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The comment belongs to a different project. | Use its actual project ID. |
| `404` | Project or comment is unavailable. | Check access and both IDs. |

## User accounts

### Create an account

`POST /appusers`

Create an account with the requested application role. This is an administrator operation, not public registration.

#### Authentication and permissions

Bearer JWT from an **ADMIN** account. Project ownership does not grant this permission.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `username` | JSON body | Yes | Nonempty, unique account username. Usernames cannot be changed later. |
| `password` | JSON body | Yes | Nonblank password: 8–72 Unicode code points, at most 72 UTF-8 bytes, no null characters or line breaks; stored hashed. |
| `role` | JSON body | Yes | `USER` or `ADMIN`. |

#### Request example

```bash
curl --include --request POST \
  --url "$BENEFIT_API_URL/appusers" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "username": "docs_owner",
  "password": "ExamplePass2026!",
  "role": "USER"
}'
```

#### Successful response

`201 Created`

```json
{
  "id": 11,
  "username": "docs_owner"
}
```

Returns [AppUserSummary](#appusersummary), without the password. Account creation enforces the same password policy as password replacement.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The caller is not an administrator. | Use an administrator account. |
| `409` | The username is already taken. | Choose another username; see `USERNAME_ALREADY_EXISTS`. |

### Get your account details

`GET /appusers/{id}`

Return your own account ID and username. This is not a general user-directory endpoint.

#### Authentication and permissions

Bearer JWT. This operation applies to your own account.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Your own account ID, available as `userId` in the JWT. |

#### Request example

```bash
curl --include --request GET \
  --url "$BENEFIT_API_URL/appusers/$APP_USER_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`200 OK`

```json
{
  "id": 11,
  "username": "docs_owner"
}
```

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The ID belongs to another account. | Use your own account ID. |
| `404` | The active account cannot be found. | Sign in again; check whether the account was deleted. |

### Change your password

`PUT /appusers/password`

Verify the current password and replace it. Success invalidates **all existing sessions**, including the current one, by incrementing the account's `session_version`.

#### Authentication and permissions

Bearer JWT. This operation applies to your own account.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `currentPassword` | JSON body | Yes | Current password; nonblank and at most 72 Java characters. |
| `newPassword` | JSON body | Yes | Nonblank replacement: 8–72 Unicode code points, at most 72 UTF-8 bytes, no null characters or line breaks. |

#### Request example

```bash
curl --include --request PUT \
  --url "$BENEFIT_API_URL/appusers/password" \
  --header "Authorization: Bearer $BENEFIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
  "currentPassword": "ExamplePass2026!",
  "newPassword": "UpdatedExample2026!"
}'
```

#### Successful response

`200 OK`

```text
Password changed successfully
```

This successful response is text, not JSON. Clear the old token and sign in again with the new password; token renewal with the old session will fail.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | The request contains missing or invalid fields. | Read the text response and correct the request. |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The current password is incorrect, or the account session changed during the request. | Check the current password; sign in again if needed. |

### Delete your account

`DELETE /appusers/{id}`

Soft-delete your account, remove it from shared projects, and soft-delete projects where it is the only member. Existing tokens for the account stop working.

#### Authentication and permissions

Bearer JWT. This operation applies to your own account.

#### Parameters

| Name | Location | Required | Description |
| --- | --- | --- | --- |
| `id` | path | Yes | Your own account ID. |

#### Request example

```bash
curl --include --request DELETE \
  --url "$BENEFIT_API_URL/appusers/$APP_USER_ID" \
  --header "Authorization: Bearer $BENEFIT_TOKEN"
```

#### Successful response

`204 No Content`

No response body.

Remove the token and account details from client storage. This endpoint is not an administrator API for deleting other users.

#### Errors and recovery

| Status | When it happens | What to do |
| --- | --- | --- |
| `401` | The token is missing, invalid, expired, or revoked. | Sign in again and use the returned token. |
| `403` | The ID belongs to another account. | Use your own account ID. |
| `404` | The active account was not found. | Check the ID and whether it has already been deleted. |

## Field reference

The endpoint sections explain what to send for each operation. These tables describe the shared objects. See [api-docs.yaml](api-docs.yaml) for the generated types and validation constraints. A nullable field may contain `null`; a field that may be omitted is not necessarily preserved when omitted from an update.

### ProjectRequest

| Field | Type | Meaning and constraints |
| --- | --- | --- |
| `projectName` | string | Required, nonblank, at most 255 characters. Display name; version creation retains the source name. |
| `version` | integer | Nonnegative version number. Use `1` for creation and retain it for updates. Version creation selects the source version plus one, ignoring this supplied value. |
| `functionalComponents` | array of FunctionalComponentRequest | Complete component tree; defaults to empty when omitted. Preserve values during updates. Version creation copies components from the source instead. |
| `calculationDate` | date or null | `YYYY-MM-DD`; omission clears it during a project update. |
| `reportContactDetails` | string or null | At most 2,000 characters; omission clears it during an update. |
| `reportNotes` | string or null | At most 5,000 characters; omission clears it during an update. |
| `lockVersion` | integer | Required for project updates; use the current response's value. Not a project version number and not needed for creation. |

### ProjectResponse

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | integer | ID of this project version. |
| `familyId` | UUID string | Immutable backend-assigned identity shared by this project’s versions. |
| `projectName` | string | Shared name of the version history. |
| `version` | integer | Version number. Highest version in the history is the latest. |
| `createdAt` | date-time | Original creation time, retained when creating a version. |
| `versionCreatedAt` | date-time | Creation time of this version. |
| `calculationDate` | date or null | Calculation date. |
| `reportContactDetails` | string or null | Report contact details. |
| `reportNotes` | string or null | Report notes. |
| `updatedAt` | date-time | Last update time, falling back to creation time. |
| `lockVersion` | integer | Current save counter for the next full update. |
| `active` | boolean | Whether the project is not soft-deleted. It does **not** mean this is the latest version. |
| `functionalComponents` | array of FunctionalComponentResponse | Active top-level components, with children nested under their parent. Use `orderPosition` for display ordering; do not assume array order is meaningful. |
| `projectAppUsers` | array of ProjectAppUserResponse | Accounts and their project-specific roles. |

Project date-times use `YYYY-MM-DDTHH:mm:ss`, without a timezone suffix. `calculationDate` uses only `YYYY-MM-DD`.

### FunctionalComponentRequest

A component's input fields depend on its FiSMA class. The API stores the calculation inputs; functional point mathematics lives in the client. See the [calculation reference](centralized_calculations.md) for the class-specific formulas.

| Field | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | integer or null | Existing component ID for a full project update. Omit for a new component. |
| `title` | string or null | At most 255 characters. |
| `description` | string or null | At most 10,000 characters. |
| `className` | string or null | FiSMA class name, at most 255 characters; for example `Interactive end-user input service`. |
| `componentType` | string or null | Class-specific component type; the example uses `Interactive`. |
| `dataElements` | integer or null | Nonnegative. |
| `readingReferences` | integer or null | Nonnegative. |
| `writingReferences` | integer or null | Nonnegative. |
| `functionalMultiplier` | integer or null | At least 1 when supplied. |
| `operations` | integer or null | Nonnegative. |
| `degreeOfCompletion` | number or null | From 0 to 1, inclusive. |
| `previousFCId` | integer or null | Counterpart in the previous project version; independent of ordering. Normally assigned by version creation. |
| `orderPosition` | integer | Required and nonnegative; display position. Component creation assigns the final position. |
| `isMLA` | boolean | Required. Indicates participation in the multi-layer architecture hierarchy. |
| `parentFCId` | integer or null | Parent component in the same project. Root components have no parent. |
| `subComponents` | array of FunctionalComponentRequest or null | Child components nested under their parent. Preserve children when updating an existing calculation. |
| `subComponentType` | string or null | `presentation`, `businessLogic`, `dataAccess`, or `integration`. |
| `isReadonly` | boolean | Defaults to `false`; cannot be null. Used for MLA child editing behavior, not account authorization. |

### FunctionalComponentResponse

Uses the same field names and JSON types as [FunctionalComponentRequest](#functionalcomponentrequest), with server-assigned `id` and ordering. `subComponents` contains nested response objects and may be `null`. The `previousFCId` and parent/child links refer to their respective project versions. Do not use a response object's nullable fields as evidence that the same values are valid in every request: request validation still applies.

### ProjectAppUserResponse

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | integer | Project-user relationship ID. This is not the `appUserId` used when removing membership. |
| `roleInProject` | string | `OWNER` or `MEMBER`. |
| `appUser` | AppUserSummary | Account's ID and username. Use `appUser.id` to remove a member. |

### ProjectMemberRequest

| Field | Type | Meaning |
| --- | --- | --- |
| `username` | string | Required, nonblank username of an existing account; surrounding whitespace is trimmed. |

### AppUserRequest

| Field | Type | Meaning |
| --- | --- | --- |
| `username` | string | Required and nonempty. Unique account username. |
| `password` | string | Required; 8–72 Unicode code points, nonblank, at most 72 UTF-8 bytes. Null characters and line breaks are not allowed. Never returned by this API. |
| `role` | string | Required: `USER` or `ADMIN`. |

### AppUserSummary

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | integer | Account ID. |
| `username` | string | Account username. |

### PasswordChangeRequest

| Field | Type | Meaning |
| --- | --- | --- |
| `currentPassword` | string | Required, nonblank, at most 72 Java characters. |
| `newPassword` | string | Required; 8–72 Unicode code points, nonblank, at most 72 UTF-8 bytes. Null characters and line breaks are not allowed. |

### CommentRequest

| Field | Type | Meaning |
| --- | --- | --- |
| `text` | string | Required, nonblank, at most 2,000 characters. |

### CommentResponse

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | integer | Comment ID. |
| `text` | string | Comment text. |
| `projectId` | integer | Project version the comment belongs to. |

### TokenResponse

| Field | Type | Meaning |
| --- | --- | --- |
| `token` | string | Signed JWT to use in `Authorization: Bearer <token>`. |
| `tokenType` | string | `Bearer`. |
| `expiresIn` | integer | Token lifetime in seconds: normally 86,400, or 2,592,000 for a remembered sign-in. Renewal near the absolute session limit may be shorter. |

The backend also returns `Authorization: Bearer <token>` as a response header. `session_version`, `auth_time`, and `jti` are JWT claims managed by the backend, not fields to add to TokenResponse or request bodies.

### ConflictResponse

| Field | Type | Meaning |
| --- | --- | --- |
| `code` | string | Stable reason for the conflict; see [conflicts and recovery](#conflicts-and-recovery). |
| `message` | string | Human-readable explanation. Use `code`, rather than matching message text, for client behavior. |
