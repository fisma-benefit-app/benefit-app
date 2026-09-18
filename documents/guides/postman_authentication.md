
# Postman Authentication Guide

Postman is a testing environment for API. Postman may be used from browser or downloaded as a VS Code extension. In this guide, we will be using the VS Code Postman extension. 

## Use Postman as an Authenticated User

Most endpoints require authentication. In this guide, we will be using the local development user `user` defined in `seed-data-dev.sql`. Make sure you're running the application in your local development environment (Docker).

### 1. Click 'New HTTP Request':

Then go to 'Authorization' tab:

- Select `Basic Auth`
- username: `user`
- password: `user`

### 2. On the top, select:

- Method: `POST`
- URL: `http://localhost:8080/token`

Press `Send`.

### 4. On the bottom, it should show 'Status: 200 OK' and 'Body' should contain JSON. 

Example JSON (without the actual token): 

```json
{"token":".................
...........................
...........................
....imagine token here.....
...........................
...........................
...........................
..","tokenType":"Bearer","expiresIn":86400}
```

### 5. Copy the raw JWT token (not the whole JSON response) without the quotation (") marks.

### 6. On the authorization tab, change the 'type' to `Bearer token`. Paste the raw token.

### 7. Test whether you're authenticated. 

- Method: `POST` 
- URL: `http://localhost:8080/projects`

On the bottom, the 'Body' tab should now show a JSON-response of the user's projects. 

`In some buggy instances, no JSON will be visible. Simply swith the tab to 'Cookies' and then switch back to 'Body'.`