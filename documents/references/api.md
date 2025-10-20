<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Project API v1.1.0](#project-api-v110)
- [Authentication](#authentication)
- [Project Management](#project-management)
  - [Get a project by ID](#get-a-project-by-id)
  - [Update a project](#update-a-project)
  - [Delete a project](#delete-a-project)
  - [Get all projects](#get-all-projects)
  - [Create a new project](#create-a-new-project)
  - [Create a new version of a project](#create-a-new-version-of-a-project)
- [User Management](#user-management)
  - [Change user password](#change-user-password)
  - [Delete user account](#delete-user-account)
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
  - [PasswordChangeRequest](#passwordchangerequest)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="project-api">Project API v1.1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

API for managing software project function point calculations

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
      "orderPosition": 1
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
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

> Example responses

> 200 Response

<h3 id="update-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Project updated successfully|[ProjectResponse](#schemaprojectresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission to update this project|[ProjectResponse](#schemaprojectresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project not found|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete a project

<a id="opIddeleteProject"></a>

`DELETE /projects/{id}`

Deletes a project if the authenticated user owns it

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

<h3 id="get-all-projects-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[ProjectResponse](#schemaprojectresponse)]|false|none|[Response object containing project details]|
|» id|integer(int64)|false|none|Unique identifier of the project|
|» projectName|string|false|none|Name of the project|
|» version|integer(int32)|false|none|Version of the project|
|» totalPoints|number(double)|false|none|Total function points of the project|
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
      "orderPosition": 1
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
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project created successfully|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid project data|None|

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
      "orderPosition": 1
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
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-version-of-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project version created successfully|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Original project not found|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="project-api-user-management">User Management</h1>

Endpoints for managing user accounts

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

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete user account

<a id="opIddeleteAppUser"></a>

`DELETE /appusers`

Permanently deletes the authenticated user's account

<h3 id="delete-user-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Account deleted successfully|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|User not authenticated|None|

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
  "orderPosition": 1
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

> Example responses

> 200 Response

<h3 id="create-a-new-functional-component-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[ProjectResponse](#schemaprojectresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Delete a functional component

<a id="opIddeleteFunctionalComponent"></a>

`DELETE /functional-components/{componentId}/projects/{projectId}`

Deletes a functional component from the specified project

<h3 id="delete-a-functional-component-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|componentId|path|integer(int64)|true|none|
|projectId|path|integer(int64)|true|none|

> Example responses

> 200 Response

<h3 id="delete-a-functional-component-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[ProjectResponse](#schemaprojectresponse)|

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
  "orderPosition": 1
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
      "orderPosition": 1
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
  "orderPosition": 1
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
  "totalPoints": 150.5,
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
      "orderPosition": 1
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
|totalPoints|number(double)|false|none|Total function points of the project|
|createdAt|string(date-time)|false|none|Creation timestamp|
|versionCreatedAt|string(date-time)|false|none|Last version update timestamp|
|updatedAt|string(date-time)|false|none|Last update timestamp|
|functionalComponents|[[FunctionalComponentResponse](#schemafunctionalcomponentresponse)]|false|none|Functional components in the project|
|projectAppUsers|[[ProjectAppUserResponse](#schemaprojectappuserresponse)]|false|none|Users associated with the project|

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

