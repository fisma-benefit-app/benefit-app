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

<h1 id="openapi-definition-project-controller">project-controller</h1>

## getProject

<a id="opIdgetProject"></a>

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/projects/{requestedId} \
  -H 'Accept: */*'

```

```http
GET http://localhost:8080/projects/{requestedId} HTTP/1.1
Host: localhost:8080
Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('http://localhost:8080/projects/{requestedId}',
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

result = RestClient.get 'http://localhost:8080/projects/{requestedId}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.get('http://localhost:8080/projects/{requestedId}', headers = headers)

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
    $response = $client->request('GET','http://localhost:8080/projects/{requestedId}', array(
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
URL obj = new URL("http://localhost:8080/projects/{requestedId}");
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
    req, err := http.NewRequest("GET", "http://localhost:8080/projects/{requestedId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /projects/{requestedId}`

<h3 id="getproject-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|requestedId|path|integer(int64)|true|none|

> Example responses

> 200 Response

<h3 id="getproject-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[Project](#schemaproject)|

<aside class="success">
This operation does not require authentication
</aside>

## updateProject

<a id="opIdupdateProject"></a>

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:8080/projects/{requestedId} \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*'

```

```http
PUT http://localhost:8080/projects/{requestedId} HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: */*

```

```javascript
const inputBody = '{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'*/*'
};

fetch('http://localhost:8080/projects/{requestedId}',
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

result = RestClient.put 'http://localhost:8080/projects/{requestedId}',
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

r = requests.put('http://localhost:8080/projects/{requestedId}', headers = headers)

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
    $response = $client->request('PUT','http://localhost:8080/projects/{requestedId}', array(
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
URL obj = new URL("http://localhost:8080/projects/{requestedId}");
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
    req, err := http.NewRequest("PUT", "http://localhost:8080/projects/{requestedId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /projects/{requestedId}`

> Body parameter

```json
{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}
```

<h3 id="updateproject-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|requestedId|path|integer(int64)|true|none|
|body|body|[Project](#schemaproject)|true|none|
|» id|body|integer(int64)|false|none|
|» projectName|body|string|false|none|
|» version|body|integer(int32)|false|none|
|» createdDate|body|string(date-time)|false|none|
|» versionDate|body|string(date-time)|false|none|
|» editedDate|body|string(date-time)|false|none|
|» totalPoints|body|number(double)|false|none|
|» functionalComponents|body|[[FunctionalComponent](#schemafunctionalcomponent)]|false|none|
|»» id|body|integer(int64)|false|none|
|»» className|body|string|false|none|
|»» componentType|body|string|false|none|
|»» dataElements|body|integer(int32)|false|none|
|»» readingReferences|body|integer(int32)|false|none|
|»» writingReferences|body|integer(int32)|false|none|
|»» functionalMultiplier|body|integer(int32)|false|none|
|»» operations|body|integer(int32)|false|none|
|»» degreeOfCompletion|body|number(double)|false|none|
|»» comment|body|string|false|none|
|»» previousFCId|body|integer(int64)|false|none|
|» appUsers|body|[[ProjectAppUser](#schemaprojectappuser)]|false|none|
|»» appUserId|body|integer(int64)|false|none|

> Example responses

> 200 Response

<h3 id="updateproject-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[Project](#schemaproject)|

<aside class="success">
This operation does not require authentication
</aside>

## deleteProject

<a id="opIddeleteProject"></a>

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:8080/projects/{requestedId}

```

```http
DELETE http://localhost:8080/projects/{requestedId} HTTP/1.1
Host: localhost:8080

```

```javascript

fetch('http://localhost:8080/projects/{requestedId}',
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

result = RestClient.delete 'http://localhost:8080/projects/{requestedId}',
  params: {
  }

p JSON.parse(result)

```

```python
import requests

r = requests.delete('http://localhost:8080/projects/{requestedId}')

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:8080/projects/{requestedId}', array(
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
URL obj = new URL("http://localhost:8080/projects/{requestedId}");
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
    req, err := http.NewRequest("DELETE", "http://localhost:8080/projects/{requestedId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`DELETE /projects/{requestedId}`

<h3 id="deleteproject-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|requestedId|path|integer(int64)|true|none|

<h3 id="deleteproject-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<aside class="success">
This operation does not require authentication
</aside>

## getAllProjects

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

> Example responses

> 200 Response

<h3 id="getallprojects-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="getallprojects-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[Project](#schemaproject)]|false|none|none|
|» id|integer(int64)|false|none|none|
|» projectName|string|false|none|none|
|» version|integer(int32)|false|none|none|
|» createdDate|string(date-time)|false|none|none|
|» versionDate|string(date-time)|false|none|none|
|» editedDate|string(date-time)|false|none|none|
|» totalPoints|number(double)|false|none|none|
|» functionalComponents|[[FunctionalComponent](#schemafunctionalcomponent)]|false|none|none|
|»» id|integer(int64)|false|none|none|
|»» className|string|false|none|none|
|»» componentType|string|false|none|none|
|»» dataElements|integer(int32)|false|none|none|
|»» readingReferences|integer(int32)|false|none|none|
|»» writingReferences|integer(int32)|false|none|none|
|»» functionalMultiplier|integer(int32)|false|none|none|
|»» operations|integer(int32)|false|none|none|
|»» degreeOfCompletion|number(double)|false|none|none|
|»» comment|string|false|none|none|
|»» previousFCId|integer(int64)|false|none|none|
|» appUsers|[[ProjectAppUser](#schemaprojectappuser)]|false|none|none|
|»» appUserId|integer(int64)|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## createProject

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
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
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

> Body parameter

```json
{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}
```

<h3 id="createproject-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Project](#schemaproject)|true|none|
|» id|body|integer(int64)|false|none|
|» projectName|body|string|false|none|
|» version|body|integer(int32)|false|none|
|» createdDate|body|string(date-time)|false|none|
|» versionDate|body|string(date-time)|false|none|
|» editedDate|body|string(date-time)|false|none|
|» totalPoints|body|number(double)|false|none|
|» functionalComponents|body|[[FunctionalComponent](#schemafunctionalcomponent)]|false|none|
|»» id|body|integer(int64)|false|none|
|»» className|body|string|false|none|
|»» componentType|body|string|false|none|
|»» dataElements|body|integer(int32)|false|none|
|»» readingReferences|body|integer(int32)|false|none|
|»» writingReferences|body|integer(int32)|false|none|
|»» functionalMultiplier|body|integer(int32)|false|none|
|»» operations|body|integer(int32)|false|none|
|»» degreeOfCompletion|body|number(double)|false|none|
|»» comment|body|string|false|none|
|»» previousFCId|body|integer(int64)|false|none|
|» appUsers|body|[[ProjectAppUser](#schemaprojectappuser)]|false|none|
|»» appUserId|body|integer(int64)|false|none|

<h3 id="createproject-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<aside class="success">
This operation does not require authentication
</aside>

## createProjectVersion

<a id="opIdcreateProjectVersion"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/projects/create-version \
  -H 'Content-Type: application/json'

```

```http
POST http://localhost:8080/projects/create-version HTTP/1.1
Host: localhost:8080
Content-Type: application/json

```

```javascript
const inputBody = '{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('http://localhost:8080/projects/create-version',
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

result = RestClient.post 'http://localhost:8080/projects/create-version',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json'
}

r = requests.post('http://localhost:8080/projects/create-version', headers = headers)

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
    $response = $client->request('POST','http://localhost:8080/projects/create-version', array(
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
URL obj = new URL("http://localhost:8080/projects/create-version");
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
    req, err := http.NewRequest("POST", "http://localhost:8080/projects/create-version", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /projects/create-version`

> Body parameter

```json
{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}
```

<h3 id="createprojectversion-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Project](#schemaproject)|true|none|
|» id|body|integer(int64)|false|none|
|» projectName|body|string|false|none|
|» version|body|integer(int32)|false|none|
|» createdDate|body|string(date-time)|false|none|
|» versionDate|body|string(date-time)|false|none|
|» editedDate|body|string(date-time)|false|none|
|» totalPoints|body|number(double)|false|none|
|» functionalComponents|body|[[FunctionalComponent](#schemafunctionalcomponent)]|false|none|
|»» id|body|integer(int64)|false|none|
|»» className|body|string|false|none|
|»» componentType|body|string|false|none|
|»» dataElements|body|integer(int32)|false|none|
|»» readingReferences|body|integer(int32)|false|none|
|»» writingReferences|body|integer(int32)|false|none|
|»» functionalMultiplier|body|integer(int32)|false|none|
|»» operations|body|integer(int32)|false|none|
|»» degreeOfCompletion|body|number(double)|false|none|
|»» comment|body|string|false|none|
|»» previousFCId|body|integer(int64)|false|none|
|» appUsers|body|[[ProjectAppUser](#schemaprojectappuser)]|false|none|
|»» appUserId|body|integer(int64)|false|none|

<h3 id="createprojectversion-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="openapi-definition-app-user-controller">app-user-controller</h1>

## changePassword

<a id="opIdchangePassword"></a>

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:8080/appusers \
  -H 'Content-Type: application/json'

```

```http
PUT http://localhost:8080/appusers HTTP/1.1
Host: localhost:8080
Content-Type: application/json

```

```javascript
const inputBody = 'string';
const headers = {
  'Content-Type':'application/json'
};

fetch('http://localhost:8080/appusers',
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
  'Content-Type' => 'application/json'
}

result = RestClient.put 'http://localhost:8080/appusers',
  params: {
  'passwordEncoder' => '[BCryptPasswordEncoder](#schemabcryptpasswordencoder)'
}, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json'
}

r = requests.put('http://localhost:8080/appusers', params={
  'passwordEncoder': null
}, headers = headers)

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
    $response = $client->request('PUT','http://localhost:8080/appusers', array(
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
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:8080/appusers", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /appusers`

> Body parameter

```json
"string"
```

<h3 id="changepassword-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|passwordEncoder|query|[BCryptPasswordEncoder](#schemabcryptpasswordencoder)|true|none|
|body|body|string|true|none|

<h3 id="changepassword-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<aside class="success">
This operation does not require authentication
</aside>

## deleteAppUser

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

<h3 id="deleteappuser-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="openapi-definition-token-controller">token-controller</h1>

## getToken

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

> Example responses

> 200 Response

<h3 id="gettoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="gettoken-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_FunctionalComponent">FunctionalComponent</h2>
<!-- backwards compatibility -->
<a id="schemafunctionalcomponent"></a>
<a id="schema_FunctionalComponent"></a>
<a id="tocSfunctionalcomponent"></a>
<a id="tocsfunctionalcomponent"></a>

```json
{
  "id": 0,
  "className": "string",
  "componentType": "string",
  "dataElements": 0,
  "readingReferences": 0,
  "writingReferences": 0,
  "functionalMultiplier": 0,
  "operations": 0,
  "degreeOfCompletion": 0.1,
  "comment": "string",
  "previousFCId": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|none|
|className|string|false|none|none|
|componentType|string|false|none|none|
|dataElements|integer(int32)|false|none|none|
|readingReferences|integer(int32)|false|none|none|
|writingReferences|integer(int32)|false|none|none|
|functionalMultiplier|integer(int32)|false|none|none|
|operations|integer(int32)|false|none|none|
|degreeOfCompletion|number(double)|false|none|none|
|comment|string|false|none|none|
|previousFCId|integer(int64)|false|none|none|

<h2 id="tocS_Project">Project</h2>
<!-- backwards compatibility -->
<a id="schemaproject"></a>
<a id="schema_Project"></a>
<a id="tocSproject"></a>
<a id="tocsproject"></a>

```json
{
  "id": 0,
  "projectName": "string",
  "version": 0,
  "createdDate": "2019-08-24T14:15:22Z",
  "versionDate": "2019-08-24T14:15:22Z",
  "editedDate": "2019-08-24T14:15:22Z",
  "totalPoints": 0.1,
  "functionalComponents": [
    {
      "id": 0,
      "className": "string",
      "componentType": "string",
      "dataElements": 0,
      "readingReferences": 0,
      "writingReferences": 0,
      "functionalMultiplier": 0,
      "operations": 0,
      "degreeOfCompletion": 0.1,
      "comment": "string",
      "previousFCId": 0
    }
  ],
  "appUsers": [
    {
      "appUserId": 0
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|none|
|projectName|string|false|none|none|
|version|integer(int32)|false|none|none|
|createdDate|string(date-time)|false|none|none|
|versionDate|string(date-time)|false|none|none|
|editedDate|string(date-time)|false|none|none|
|totalPoints|number(double)|false|none|none|
|functionalComponents|[[FunctionalComponent](#schemafunctionalcomponent)]|false|none|none|
|appUsers|[[ProjectAppUser](#schemaprojectappuser)]|false|none|none|

<h2 id="tocS_ProjectAppUser">ProjectAppUser</h2>
<!-- backwards compatibility -->
<a id="schemaprojectappuser"></a>
<a id="schema_ProjectAppUser"></a>
<a id="tocSprojectappuser"></a>
<a id="tocsprojectappuser"></a>

```json
{
  "appUserId": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|appUserId|integer(int64)|false|none|none|

<h2 id="tocS_BCryptPasswordEncoder">BCryptPasswordEncoder</h2>
<!-- backwards compatibility -->
<a id="schemabcryptpasswordencoder"></a>
<a id="schema_BCryptPasswordEncoder"></a>
<a id="tocSbcryptpasswordencoder"></a>
<a id="tocsbcryptpasswordencoder"></a>

```json
null

```

### Properties

*None*

