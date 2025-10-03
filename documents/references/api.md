---
title: OpenAPI definition v0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="openapi-definition">OpenAPI definition v0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Base URLs:

* <a href="http://localhost:8080">http://localhost:8080</a>

<h1 id="openapi-definition-project-management">Project Management</h1>

Endpoints for managing projects

## Get a project by ID

<a id="opIdgetProject"></a>

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/projects/{id} \
  -H 'Accept: */*'

```

```http
GET http://localhost:8080/projects/{id} HTTP/1.1
Host: localhost:8080
Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('http://localhost:8080/projects/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => '*/*'
}

result = RestClient.get 'http://localhost:8080/projects/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.get('http://localhost:8080/projects/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/projects/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/projects/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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

<aside class="success">
This operation does not require authentication
</aside>

## Update a project

<a id="opIdupdateProject"></a>

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:8080/projects/{id} \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*'

```

```http
PUT http://localhost:8080/projects/{id} HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: */*

```

```javascript
const inputBody = '{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "previousFCId": 123,
      "orderPosition": 1
    }
  ],
  "projectAppUserIds": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'*/*'
};

fetch('http://localhost:8080/projects/{id}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => '*/*'
}

result = RestClient.put 'http://localhost:8080/projects/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*'
}

r = requests.put('http://localhost:8080/projects/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:8080/projects/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:8080/projects/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
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
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
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

<aside class="success">
This operation does not require authentication
</aside>

## Delete a project

<a id="opIddeleteProject"></a>

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:8080/projects/{id}

```

```http
DELETE http://localhost:8080/projects/{id} HTTP/1.1
Host: localhost:8080

```

```javascript

fetch('http://localhost:8080/projects/{id}',
{
  method: 'DELETE'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

result = RestClient.delete 'http://localhost:8080/projects/{id}',
  params: {
  }

p JSON.parse(result)

```

```python
import requests

r = requests.delete('http://localhost:8080/projects/{id}')

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:8080/projects/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:8080/projects/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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

<aside class="success">
This operation does not require authentication
</aside>

## Get all projects

<a id="opIdgetAllProjects"></a>

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/projects \
  -H 'Accept: */*'

```

```http
GET http://localhost:8080/projects HTTP/1.1
Host: localhost:8080
Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('http://localhost:8080/projects',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => '*/*'
}

result = RestClient.get 'http://localhost:8080/projects',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.get('http://localhost:8080/projects', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/projects', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/projects", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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
|» createdDate|string(date-time)|false|none|Creation timestamp|
|» versionDate|string(date-time)|false|none|Last version update timestamp|
|» editedDate|string(date-time)|false|none|Last modification timestamp|
|» totalPoints|number(double)|false|none|Total function points of the project|
|» functionalComponents|[[FunctionalComponentResponse](#schemafunctionalcomponentresponse)]|false|none|Functional components in the project|
|»» id|integer(int64)|false|none|Unique identifier|
|»» className|string|false|none|Name of the class|
|»» componentType|string|false|none|Type of the functional component|
|»» dataElements|integer(int32)|false|none|Number of data elements|
|»» readingReferences|integer(int32)|false|none|Number of reading references|
|»» writingReferences|integer(int32)|false|none|Number of writing references|
|»» functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|»» operations|integer(int32)|false|none|Number of operations|
|»» degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|»» title|string|false|none|Title of the functional component|
|»» description|string|false|none|Detailed description of the functional component|
|»» previousFCId|integer(int64)|false|none|ID of the previous functional component for ordering|
|»» orderPosition|integer(int32)|false|none|Position in the component list|
|» projectAppUsers|[[ProjectAppUserResponse](#schemaprojectappuserresponse)]|false|none|Users associated with the project|
|»» id|integer(int64)|false|none|ID of the project-user relationship|
|»» appUser|[AppUserSummary](#schemaappusersummary)|false|none|Summary information about an application user|
|»»» id|integer(int64)|false|none|Unique identifier of the user|
|»»» username|string|false|none|Username of the user|

<aside class="success">
This operation does not require authentication
</aside>

## Create a new project

<a id="opIdcreateProject"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/projects \
  -H 'Content-Type: application/json'

```

```http
POST http://localhost:8080/projects HTTP/1.1
Host: localhost:8080
Content-Type: application/json

```

```javascript
const inputBody = '{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "previousFCId": 123,
      "orderPosition": 1
    }
  ],
  "projectAppUserIds": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('http://localhost:8080/projects',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json'
}

result = RestClient.post 'http://localhost:8080/projects',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json'
}

r = requests.post('http://localhost:8080/projects', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/projects', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/projects", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
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
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
|»» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|»» orderPosition|body|integer(int32)|true|Position in the component list|
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project created successfully|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid project data|None|

<aside class="success">
This operation does not require authentication
</aside>

## Create a new version of a project

<a id="opIdcreateProjectVersion"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/projects/{id}/versions \
  -H 'Content-Type: application/json'

```

```http
POST http://localhost:8080/projects/{id}/versions HTTP/1.1
Host: localhost:8080
Content-Type: application/json

```

```javascript
const inputBody = '{
  "projectName": "User Authentication System",
  "version": 1,
  "functionalComponents": [
    {
      "id": 1,
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
      "previousFCId": 123,
      "orderPosition": 1
    }
  ],
  "projectAppUserIds": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('http://localhost:8080/projects/{id}/versions',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json'
}

result = RestClient.post 'http://localhost:8080/projects/{id}/versions',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json'
}

r = requests.post('http://localhost:8080/projects/{id}/versions', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/projects/{id}/versions', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/projects/{id}/versions");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/projects/{id}/versions", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
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
|»» className|body|string|false|Name of the class|
|»» componentType|body|string|false|Type of the functional component|
|»» dataElements|body|integer(int32)|false|Number of data elements|
|»» readingReferences|body|integer(int32)|false|Number of reading references|
|»» writingReferences|body|integer(int32)|false|Number of writing references|
|»» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|»» operations|body|integer(int32)|false|Number of operations|
|»» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|»» title|body|string|false|Title of the functional component|
|»» description|body|string|false|Detailed description of the functional component|
|»» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|»» orderPosition|body|integer(int32)|true|Position in the component list|
|» projectAppUserIds|body|[integer]|false|List of user IDs to associate with the project|

<h3 id="create-a-new-version-of-a-project-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Project version created successfully|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|User does not have permission|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Original project not found|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="openapi-definition-user-management">User Management</h1>

Endpoints for managing user accounts

## Change user password

<a id="opIdchangePassword"></a>

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:8080/appusers/password \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*'

```

```http
PUT http://localhost:8080/appusers/password HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: */*

```

```javascript
const inputBody = '{
  "newPassword": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'*/*'
};

fetch('http://localhost:8080/appusers/password',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => '*/*'
}

result = RestClient.put 'http://localhost:8080/appusers/password',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*'
}

r = requests.put('http://localhost:8080/appusers/password', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:8080/appusers/password', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/appusers/password");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:8080/appusers/password", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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

<aside class="success">
This operation does not require authentication
</aside>

## Delete user account

<a id="opIddeleteAppUser"></a>

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:8080/appusers

```

```http
DELETE http://localhost:8080/appusers HTTP/1.1
Host: localhost:8080

```

```javascript

fetch('http://localhost:8080/appusers',
{
  method: 'DELETE'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

result = RestClient.delete 'http://localhost:8080/appusers',
  params: {
  }

p JSON.parse(result)

```

```python
import requests

r = requests.delete('http://localhost:8080/appusers')

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:8080/appusers', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/appusers");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:8080/appusers", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`DELETE /appusers`

Permanently deletes the authenticated user's account

<h3 id="delete-user-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Account deleted successfully|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|User not authenticated|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="openapi-definition-functional-components">Functional Components</h1>

Endpoints for managing functional components within projects

## Create a new functional component

<a id="opIdcreateFunctionalComponent"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/functional-components/projects/{projectId} \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*'

```

```http
POST http://localhost:8080/functional-components/projects/{projectId} HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: */*

```

```javascript
const inputBody = '{
  "id": 1,
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "title": "Create User Account",
  "description": "Handles user account creation process",
  "previousFCId": 123,
  "orderPosition": 1
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'*/*'
};

fetch('http://localhost:8080/functional-components/projects/{projectId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => '*/*'
}

result = RestClient.post 'http://localhost:8080/functional-components/projects/{projectId}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*'
}

r = requests.post('http://localhost:8080/functional-components/projects/{projectId}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/functional-components/projects/{projectId}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/functional-components/projects/{projectId}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/functional-components/projects/{projectId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /functional-components/projects/{projectId}`

Creates a new functional component in the specified project

> Body parameter

```json
{
  "id": 1,
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "title": "Create User Account",
  "description": "Handles user account creation process",
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
|» className|body|string|false|Name of the class|
|» componentType|body|string|false|Type of the functional component|
|» dataElements|body|integer(int32)|false|Number of data elements|
|» readingReferences|body|integer(int32)|false|Number of reading references|
|» writingReferences|body|integer(int32)|false|Number of writing references|
|» functionalMultiplier|body|integer(int32)|false|Multiplier for functional points calculation|
|» operations|body|integer(int32)|false|Number of operations|
|» degreeOfCompletion|body|number(double)|false|Completion status (0.0 to 1.0)|
|» title|body|string|false|Title of the functional component|
|» description|body|string|false|Detailed description of the functional component|
|» previousFCId|body|integer(int64)|false|ID of the previous functional component for ordering|
|» orderPosition|body|integer(int32)|true|Position in the component list|

> Example responses

> 200 Response

<h3 id="create-a-new-functional-component-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[ProjectResponse](#schemaprojectresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## Delete a functional component

<a id="opIddeleteFunctionalComponent"></a>

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:8080/functional-components/{componentId}/projects/{projectId} \
  -H 'Accept: */*'

```

```http
DELETE http://localhost:8080/functional-components/{componentId}/projects/{projectId} HTTP/1.1
Host: localhost:8080
Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('http://localhost:8080/functional-components/{componentId}/projects/{projectId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => '*/*'
}

result = RestClient.delete 'http://localhost:8080/functional-components/{componentId}/projects/{projectId}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.delete('http://localhost:8080/functional-components/{componentId}/projects/{projectId}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:8080/functional-components/{componentId}/projects/{projectId}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/functional-components/{componentId}/projects/{projectId}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:8080/functional-components/{componentId}/projects/{projectId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="openapi-definition-token-generation">Token Generation</h1>

Endpoint for generating token

## Generate a JWT

<a id="opIdgetToken"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/token \
  -H 'Accept: */*'

```

```http
POST http://localhost:8080/token HTTP/1.1
Host: localhost:8080
Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('http://localhost:8080/token',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => '*/*'
}

result = RestClient.post 'http://localhost:8080/token',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.post('http://localhost:8080/token', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/token', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/token");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/token", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

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
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "title": "Create User Account",
  "description": "Handles user account creation process",
  "previousFCId": 123,
  "orderPosition": 1
}

```

Request object for creating or updating functional components within a project

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier|
|className|string|false|none|Name of the class|
|componentType|string|false|none|Type of the functional component|
|dataElements|integer(int32)|false|none|Number of data elements|
|readingReferences|integer(int32)|false|none|Number of reading references|
|writingReferences|integer(int32)|false|none|Number of writing references|
|functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|operations|integer(int32)|false|none|Number of operations|
|degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|title|string|false|none|Title of the functional component|
|description|string|false|none|Detailed description of the functional component|
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
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "Handles user account creation process",
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
  "className": "UserAccount",
  "componentType": "string",
  "dataElements": 5,
  "readingReferences": 2,
  "writingReferences": 1,
  "functionalMultiplier": 3,
  "operations": 4,
  "degreeOfCompletion": 0.75,
  "title": "Create User Account",
  "description": "string",
  "previousFCId": 123,
  "orderPosition": 1
}

```

Response object containing details on functional components within a project

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|Unique identifier|
|className|string|false|none|Name of the class|
|componentType|string|false|none|Type of the functional component|
|dataElements|integer(int32)|false|none|Number of data elements|
|readingReferences|integer(int32)|false|none|Number of reading references|
|writingReferences|integer(int32)|false|none|Number of writing references|
|functionalMultiplier|integer(int32)|false|none|Multiplier for functional points calculation|
|operations|integer(int32)|false|none|Number of operations|
|degreeOfCompletion|number(double)|false|none|Completion status (0.0 to 1.0)|
|title|string|false|none|Title of the functional component|
|description|string|false|none|Detailed description of the functional component|
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
  "createdDate": "2025-09-25T10:30:00",
  "versionDate": "2025-09-25T15:45:00",
  "editedDate": "2025-09-25T15:45:00",
  "totalPoints": 150.5,
  "functionalComponents": [
    {
      "id": 1,
      "className": "UserAccount",
      "componentType": "string",
      "dataElements": 5,
      "readingReferences": 2,
      "writingReferences": 1,
      "functionalMultiplier": 3,
      "operations": 4,
      "degreeOfCompletion": 0.75,
      "title": "Create User Account",
      "description": "string",
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
|createdDate|string(date-time)|false|none|Creation timestamp|
|versionDate|string(date-time)|false|none|Last version update timestamp|
|editedDate|string(date-time)|false|none|Last modification timestamp|
|totalPoints|number(double)|false|none|Total function points of the project|
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

