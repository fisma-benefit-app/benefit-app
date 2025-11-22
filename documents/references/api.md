<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Project API v1.0.1](#project-api-v101)
- [Authentication](#authentication)
- [Project Management](#project-management)
  - [Get a project by ID](#get-a-project-by-id)
  - [Update a project](#update-a-project)
  - [Delete a project](#delete-a-project)
  - [Get all projects](#get-all-projects)
  - [Create a new project](#create-a-new-project)
  - [Create a new version of a project](#create-a-new-version-of-a-project)
- [User Management](#user-management)
  - [Get user by ID](#get-user-by-id)
  - [Update user](#update-user)
  - [Delete user account](#delete-user-account)
  - [Change user password](#change-user-password)
  - [Create new user](#create-new-user)
- [Functional Components](#functional-components)
  - [Create a new functional component](#create-a-new-functional-component)
  - [Delete a functional component](#delete-a-functional-component)
- [Token Generation](#token-generation)
  - [Generate a JWT](#generate-a-jwt)
- [Schemas](#schemas)
  - [FunctionalComponentRequest](#functionalcomponentrequest)
  - [ProjectRequest](#projectrequest)
  - [AppUserSummary](#appusersummary)
  - [FunctionalComponentResponse](#functionalcomponentresponse)
  - [ProjectAppUserResponse](#projectappuserresponse)
  - [ProjectResponse](#projectresponse)
  - [AppUserRequest](#appuserrequest)
  - [PasswordChangeRequest](#passwordchangerequest)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="project-api">Project API v1.0.1</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

API documentation for the benefit application

Base URLs:

* <a href="http://localhost:8080">http://localhost:8080</a>

# Authentication

- HTTP Authentication, scheme: bearer 

<h1 id="project-api-project-management">Project Management</h1>

Endpoints for managing projects

## Get a project by ID

<a id="opIdgetProject"></a>

`GET /projects/{id}`

Retrieves a specific project if the authenticated user has access to it

<h3 id="get-a-project-by-id-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|ID of the project to retrieve|

> Example responses

> 200 Response

<h3 id="get-a-project-by-id-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Project found and returned|[ProjectResponse](#schemaprojectresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have access to this project|[ProjectResponse](#schemaprojectresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project not found|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Update a project

<a id="opIdupdateProject"></a>

`PUT /projects/{id}`

Updates an existing project if the authenticated user owns it

> Body parameter

```json
{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "previousFCId": 123,
      "orderPosition": 1,
      "isMLA": true,
      "parentFCId": 12
    }
  ],
  "projectAppUserIds": [
    0
  ]
}
```

<h3 id="update-a-project-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|ID of the project to update|
|body|body|[ProjectRequest](#schemaprojectrequest)|true|none|
|» projectName|body|string|true|Name of the project|
|» version|body|integer(int32)|true|Version of the project|
|» functionalComponents|body|[[FunctionalComponentRequest](#schemafunctionalcomponentrequest)]|false|List of functional components in the project|
|»» id|body|integer(int64)|false|Unique identifier|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|»» orderPosition|body|integer(int32)|true|Position in the component list|
|»» isMLA|body|boolean|true|Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.|
|»» parentFCId|body|integer(int64)|false|ID of the parent functional component, if part of multi-layer architecture|
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

> Example responses

> 200 Response

<h3 id="update-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Project updated successfully|[ProjectResponse](#schemaprojectresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission to update this project|[ProjectResponse](#schemaprojectresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project not found|[ProjectResponse](#schemaprojectresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error - update operation failed|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete a project

<a id="opIddeleteProject"></a>

`DELETE /projects/{id}`

Soft deletes a project if the authenticated user owns it

<h3 id="delete-a-project-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|ID of the project to delete|

<h3 id="delete-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Project deleted successfully|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission to delete this project|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project not found|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get all projects

<a id="opIdgetAllProjects"></a>

`GET /projects`

Retrieves all projects accessible to the authenticated user

> Example responses

> 200 Response

<h3 id="get-all-projects-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|List of projects returned|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error - database connection issues|Inline|

<h3 id="get-all-projects-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[ProjectResponse](#schemaprojectresponse)]|false|none|[Response object containing project details]|
|» id|integer(int64)|false|none|Unique identifier of the project|
|» projectName|string|false|none|Name of the project|
|» version|integer(int32)|false|none|Version of the project|
|» createdAt|string(date-time)|false|none|Creation timestamp|
|» versionCreatedAt|string(date-time)|false|none|Last version update timestamp|
|» updatedAt|string(date-time)|false|none|Last update timestamp|
|» functionalComponents|[[FunctionalComponentResponse](#schemafunctionalcomponentresponse)]|false|none|Functional components in the project|
|»» id|integer(int64)|false|none|Unique identifier|
|»» title|string|false|none|Title of the functional component|
|»» description|string|false|none|Detailed description of the functional component|
|»» className|string|false|none|Name of the class|
|»» componentType|string|false|none|Type of the functional component|
|»» dataElements|integer(int32)|false|none|Number of data elements|
|»» readingReferences|integer(int32)|false|none|Number of reading references|
|»» writingReferences|integer(int32)|false|none|Number of writing references|
|»» functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|»» operations|integer(int32)|false|none|Number of operations|
|»» degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|»» previousFCId|integer(int64)|false|none|ID of the previous functional component for ordering|
|»» orderPosition|integer(int32)|false|none|Position in the component list|
|»» isMLA|boolean|false|none|Whether the functional component is part of multi-layer architecture (MLA)|
|»» parentFCId|integer(int64)|false|none|ID of the parent functional component, if part of multi-layer architecture (MLA)|
|» projectAppUsers|[[ProjectAppUserResponse](#schemaprojectappuserresponse)]|false|none|Users associated with the project|
|»» id|integer(int64)|false|none|ID of the project-user relationship|
|»» appUser|[AppUserSummary](#schemaappusersummary)|false|none|Summary information about an application user|
|»»» id|integer(int64)|false|none|Unique identifier of the user|
|»»» username|string|false|none|Username of the user|

Status Code **500**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[ProjectResponse](#schemaprojectresponse)]|false|none|[Response object containing project details]|
|» id|integer(int64)|false|none|Unique identifier of the project|
|» projectName|string|false|none|Name of the project|
|» version|integer(int32)|false|none|Version of the project|
|» createdAt|string(date-time)|false|none|Creation timestamp|
|» versionCreatedAt|string(date-time)|false|none|Last version update timestamp|
|» updatedAt|string(date-time)|false|none|Last update timestamp|
|» functionalComponents|[[FunctionalComponentResponse](#schemafunctionalcomponentresponse)]|false|none|Functional components in the project|
|»» id|integer(int64)|false|none|Unique identifier|
|»» title|string|false|none|Title of the functional component|
|»» description|string|false|none|Detailed description of the functional component|
|»» className|string|false|none|Name of the class|
|»» componentType|string|false|none|Type of the functional component|
|»» dataElements|integer(int32)|false|none|Number of data elements|
|»» readingReferences|integer(int32)|false|none|Number of reading references|
|»» writingReferences|integer(int32)|false|none|Number of writing references|
|»» functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|»» operations|integer(int32)|false|none|Number of operations|
|»» degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|»» previousFCId|integer(int64)|false|none|ID of the previous functional component for ordering|
|»» orderPosition|integer(int32)|false|none|Position in the component list|
|»» isMLA|boolean|false|none|Whether the functional component is part of multi-layer architecture (MLA)|
|»» parentFCId|integer(int64)|false|none|ID of the parent functional component, if part of multi-layer architecture (MLA)|
|» projectAppUsers|[[ProjectAppUserResponse](#schemaprojectappuserresponse)]|false|none|Users associated with the project|
|»» id|integer(int64)|false|none|ID of the project-user relationship|
|»» appUser|[AppUserSummary](#schemaappusersummary)|false|none|Summary information about an application user|
|»»» id|integer(int64)|false|none|Unique identifier of the user|
|»»» username|string|false|none|Username of the user|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Create a new project

<a id="opIdcreateProject"></a>

`POST /projects`

Creates a new project for the authenticated user

> Body parameter

```json
{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "previousFCId": 123,
      "orderPosition": 1,
      "isMLA": true,
      "parentFCId": 12
    }
  ],
  "projectAppUserIds": [
    0
  ]
}
```

<h3 id="create-a-new-project-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ProjectRequest](#schemaprojectrequest)|true|none|
|» projectName|body|string|true|Name of the project|
|» version|body|integer(int32)|true|Version of the project|
|» functionalComponents|body|[[FunctionalComponentRequest](#schemafunctionalcomponentrequest)]|false|List of functional components in the project|
|»» id|body|integer(int64)|false|Unique identifier|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|»» orderPosition|body|integer(int32)|true|Position in the component list|
|»» isMLA|body|boolean|true|Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.|
|»» parentFCId|body|integer(int64)|false|ID of the parent functional component, if part of multi-layer architecture|
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project created successfully|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid project data|None|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Service unavailable - system resources exhausted|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Create a new version of a project

<a id="opIdcreateProjectVersion"></a>

`POST /projects/{id}/versions`

Creates a new version of an existing project

> Body parameter

```json
{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "previousFCId": 123,
      "orderPosition": 1,
      "isMLA": true,
      "parentFCId": 12
    }
  ],
  "projectAppUserIds": [
    0
  ]
}
```

<h3 id="create-a-new-version-of-a-project-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|ID of the project to version|
|body|body|[ProjectRequest](#schemaprojectrequest)|true|none|
|» projectName|body|string|true|Name of the project|
|» version|body|integer(int32)|true|Version of the project|
|» functionalComponents|body|[[FunctionalComponentRequest](#schemafunctionalcomponentrequest)]|false|List of functional components in the project|
|»» id|body|integer(int64)|false|Unique identifier|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|»» orderPosition|body|integer(int32)|true|Position in the component list|
|»» isMLA|body|boolean|true|Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.|
|»» parentFCId|body|integer(int64)|false|ID of the parent functional component, if part of multi-layer architecture|
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-version-of-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project version created successfully|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Original project not found|None|
|507|[Insufficient Storage](https://tools.ietf.org/html/rfc2518#section-10.6)|Insufficient storage - project size limit exceeded|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="project-api-user-management">User Management</h1>

Endpoints for managing user accounts

## Get user by ID

<a id="opIdgetById"></a>

`GET /appusers/{id}`

Retrieves a specific user by their ID

<h3 id="get-user-by-id-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|none|

> Example responses

> 200 Response

<h3 id="get-user-by-id-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User found|[AppUserSummary](#schemaappusersummary)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|User not found|[AppUserSummary](#schemaappusersummary)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Update user

<a id="opIdupdateAppUser"></a>

`PUT /appusers/{id}`

Updates an existing user's information

> Body parameter

```json
{
  "username": "string",
  "password": "string"
}
```

<h3 id="update-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|none|
|body|body|[AppUserRequest](#schemaappuserrequest)|true|none|
|» username|body|string|true|none|
|» password|body|string|true|none|

> Example responses

> 200 Response

<h3 id="update-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User updated successfully|[AppUserSummary](#schemaappusersummary)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|User not found|[AppUserSummary](#schemaappusersummary)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Failed to update user due to database constraint violation or internal error|[AppUserSummary](#schemaappusersummary)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete user account

<a id="opIddeleteAppUser"></a>

`DELETE /appusers/{id}`

Permanently deletes the authenticated user's account

<h3 id="delete-user-account-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer(int64)|true|none|

<h3 id="delete-user-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Account deleted successfully|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|User not authenticated|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Failed to delete user due to database integrity constraints or cascading deletion errors|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Change user password

<a id="opIdchangePassword"></a>

`PUT /appusers/password`

Allows authenticated users to change their password

> Body parameter

```json
{
  "newPassword": "string"
}
```

<h3 id="change-user-password-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[PasswordChangeRequest](#schemapasswordchangerequest)|true|none|
|» newPassword|body|string|true|none|

> Example responses

> 200 Response

<h3 id="change-user-password-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Password changed successfully|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid password format|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|User not authenticated|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Password encryption failure or database error during password update|string|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Create new user

<a id="opIdcreateAppUser"></a>

`POST /appusers`

Creates a new user account

> Body parameter

```json
{
  "username": "string",
  "password": "string"
}
```

<h3 id="create-new-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AppUserRequest](#schemaappuserrequest)|true|none|
|» username|body|string|true|none|
|» password|body|string|true|none|

> Example responses

> 201 Response

<h3 id="create-new-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|User created successfully|[AppUserSummary](#schemaappusersummary)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid user data|[AppUserSummary](#schemaappusersummary)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="project-api-functional-components">Functional Components</h1>

Endpoints for managing functional components within projects

## Create a new functional component

<a id="opIdcreateFunctionalComponent"></a>

`POST /functional-components/projects/{projectId}`

Creates a new functional component in the specified project

> Body parameter

```json
{
  "id": 1,
  "title": "Create User Account",
  "description": "Handles user account creation process",
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "previousFCId": 123,
  "orderPosition": 1,
  "isMLA": true,
  "parentFCId": 12
}
```

<h3 id="create-a-new-functional-component-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|projectId|path|integer(int64)|true|none|
|body|body|[FunctionalComponentRequest](#schemafunctionalcomponentrequest)|true|none|
|» id|body|integer(int64)|false|Unique identifier|
|» title|body|string|false|Title of the functional component|
|» description|body|string|false|Detailed description of the functional component|
|» className|body|string|false|Name of the class|
|» componentType|body|string|false|Type of the functional component|
|» dataElements|body|integer(int32)|false|Number of data elements|
|» readingReferences|body|integer(int32)|false|Number of reading references|
|» writingReferences|body|integer(int32)|false|Number of writing references|
|» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|» operations|body|integer(int32)|false|Number of operations|
|» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|» orderPosition|body|integer(int32)|true|Position in the component list|
|» isMLA|body|boolean|true|Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.|
|» parentFCId|body|integer(int64)|false|ID of the parent functional component, if part of multi-layer architecture|

> Example responses

> 200 Response

<h3 id="create-a-new-functional-component-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Functional component created successfully|[ProjectResponse](#schemaprojectresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request data|[ProjectResponse](#schemaprojectresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete a functional component

<a id="opIddeleteFunctionalComponent"></a>

`DELETE /functional-components/{componentId}/projects/{projectId}`

Soft deletes a functional component from the specified project

<h3 id="delete-a-functional-component-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|componentId|path|integer(int64)|true|none|
|projectId|path|integer(int64)|true|none|

> Example responses

> 201 Response

<h3 id="delete-a-functional-component-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Functional component deleted successfully|[ProjectResponse](#schemaprojectresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized|[ProjectResponse](#schemaprojectresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Component or project not found|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="project-api-token-generation">Token Generation</h1>

Endpoint for generating token

## Generate a JWT

<a id="opIdgetToken"></a>

`POST /token`

Generates a signed JWT for an authenticated user

> Example responses

> 200 Response

<h3 id="generate-a-jwt-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Token generated successfully|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|User not authenticated|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Failed to encode the token|Inline|

<h3 id="generate-a-jwt-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_FunctionalComponentRequest">FunctionalComponentRequest</h2>
<!-- backwards compatibility -->
<a id="schemafunctionalcomponentrequest"></a>
<a id="schema_FunctionalComponentRequest"></a>
<a id="tocSfunctionalcomponentrequest"></a>
<a id="tocsfunctionalcomponentrequest"></a>

```json
{
  "id": 1,
  "title": "Create User Account",
  "description": "Handles user account creation process",
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "previousFCId": 123,
  "orderPosition": 1,
  "isMLA": true,
  "parentFCId": 12
}

```

Request object for creating or updating functional components within a project

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier|
|title|string|false|none|Title of the functional component|
|description|string|false|none|Detailed description of the functional component|
|className|string|false|none|Name of the class|
|componentType|string|false|none|Type of the functional component|
|dataElements|integer(int32)|false|none|Number of data elements|
|readingReferences|integer(int32)|false|none|Number of reading references|
|writingReferences|integer(int32)|false|none|Number of writing references|
|functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|operations|integer(int32)|false|none|Number of operations|
|degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|previousFCId|integer(int64)|false|none|ID of the previous functional component for ordering|
|orderPosition|integer(int32)|true|none|Position in the component list|
|isMLA|boolean|true|none|Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.|
|parentFCId|integer(int64)|false|none|ID of the parent functional component, if part of multi-layer architecture|

<h2 id="tocS_ProjectRequest">ProjectRequest</h2>
<!-- backwards compatibility -->
<a id="schemaprojectrequest"></a>
<a id="schema_ProjectRequest"></a>
<a id="tocSprojectrequest"></a>
<a id="tocsprojectrequest"></a>

```json
{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "previousFCId": 123,
      "orderPosition": 1,
      "isMLA": true,
      "parentFCId": 12
    }
  ],
  "projectAppUserIds": [
    0
  ]
}

```

Request object for creating or updating a project

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|projectName|string|true|none|Name of the project|
|version|integer(int32)|true|none|Version of the project|
|functionalComponents|[[FunctionalComponentRequest](#schemafunctionalcomponentrequest)]|false|none|List of functional components in the project|
|projectAppUserIds|[integer]|false|none|List of user IDs to associate with the project|

<h2 id="tocS_AppUserSummary">AppUserSummary</h2>
<!-- backwards compatibility -->
<a id="schemaappusersummary"></a>
<a id="schema_AppUserSummary"></a>
<a id="tocSappusersummary"></a>
<a id="tocsappusersummary"></a>

```json
{
  "id": 1,
  "username": "john.doe"
}

```

Summary information about an application user

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier of the user|
|username|string|false|none|Username of the user|

<h2 id="tocS_FunctionalComponentResponse">FunctionalComponentResponse</h2>
<!-- backwards compatibility -->
<a id="schemafunctionalcomponentresponse"></a>
<a id="schema_FunctionalComponentResponse"></a>
<a id="tocSfunctionalcomponentresponse"></a>
<a id="tocsfunctionalcomponentresponse"></a>

```json
{
  "id": 1,
  "title": "Create User Account",
  "description": "string",
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "previousFCId": 123,
  "orderPosition": 1,
  "isMLA": true,
  "parentFCId": 12
}

```

Response object containing details on functional components within a project

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier|
|title|string|false|none|Title of the functional component|
|description|string|false|none|Detailed description of the functional component|
|className|string|false|none|Name of the class|
|componentType|string|false|none|Type of the functional component|
|dataElements|integer(int32)|false|none|Number of data elements|
|readingReferences|integer(int32)|false|none|Number of reading references|
|writingReferences|integer(int32)|false|none|Number of writing references|
|functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|operations|integer(int32)|false|none|Number of operations|
|degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|previousFCId|integer(int64)|false|none|ID of the previous functional component for ordering|
|orderPosition|integer(int32)|false|none|Position in the component list|
|isMLA|boolean|false|none|Whether the functional component is part of multi-layer architecture (MLA)|
|parentFCId|integer(int64)|false|none|ID of the parent functional component, if part of multi-layer architecture (MLA)|

<h2 id="tocS_ProjectAppUserResponse">ProjectAppUserResponse</h2>
<!-- backwards compatibility -->
<a id="schemaprojectappuserresponse"></a>
<a id="schema_ProjectAppUserResponse"></a>
<a id="tocSprojectappuserresponse"></a>
<a id="tocsprojectappuserresponse"></a>

```json
{
  "id": 1,
  "appUser": {
    "id": 1,
    "username": "john.doe"
  }
}

```

Response object containing project-user relationship details

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|ID of the project-user relationship|
|appUser|[AppUserSummary](#schemaappusersummary)|false|none|AppUser details|

<h2 id="tocS_ProjectResponse">ProjectResponse</h2>
<!-- backwards compatibility -->
<a id="schemaprojectresponse"></a>
<a id="schema_ProjectResponse"></a>
<a id="tocSprojectresponse"></a>
<a id="tocsprojectresponse"></a>

```json
{
  "id": 1,
  "projectName": "User Authentication Service",
  "version": 1,
  "createdAt": "2025-09-25T10:30:00",
  "versionCreatedAt": "2025-09-25T15:45:00",
  "updatedAt": "2025-09-25T15:45:00",
  "functionalComponents": [
    {
      "id": 1,
      "title": "Create User Account",
      "description": "string",
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "previousFCId": 123,
      "orderPosition": 1,
      "isMLA": true,
      "parentFCId": 12
    }
  ],
  "projectAppUsers": [
    {
      "id": 1,
      "appUser": {
        "id": 1,
        "username": "john.doe"
      }
    }
  ]
}

```

Response object containing project details

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier of the project|
|projectName|string|false|none|Name of the project|
|version|integer(int32)|false|none|Version of the project|
|createdAt|string(date-time)|false|none|Creation timestamp|
|versionCreatedAt|string(date-time)|false|none|Last version update timestamp|
|updatedAt|string(date-time)|false|none|Last update timestamp|
|functionalComponents|[[FunctionalComponentResponse](#schemafunctionalcomponentresponse)]|false|none|Functional components in the project|
|projectAppUsers|[[ProjectAppUserResponse](#schemaprojectappuserresponse)]|false|none|Users associated with the project|

<h2 id="tocS_AppUserRequest">AppUserRequest</h2>
<!-- backwards compatibility -->
<a id="schemaappuserrequest"></a>
<a id="schema_AppUserRequest"></a>
<a id="tocSappuserrequest"></a>
<a id="tocsappuserrequest"></a>

```json
{
  "username": "string",
  "password": "string"
}

```

Request object for creating or updating app users

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|username|string|true|none|none|
|password|string|true|none|none|

<h2 id="tocS_PasswordChangeRequest">PasswordChangeRequest</h2>
<!-- backwards compatibility -->
<a id="schemapasswordchangerequest"></a>
<a id="schema_PasswordChangeRequest"></a>
<a id="tocSpasswordchangerequest"></a>
<a id="tocspasswordchangerequest"></a>

```json
{
  "newPassword": "string"
}

```

Request object containing details on password change

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|newPassword|string|true|none|none|

