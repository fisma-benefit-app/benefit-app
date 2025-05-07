# Known issues

This document will log all known issues in the Benefit-app.
Issues can be e.g. bugs, responsive problems, techincal 
issues in database, etc.

## Spring 2025, working group from Haaga-Helia University of Applied Sciences.

### While the user is trying to log in and VITE_API_URL is not correct.

POST
http://localhost:5173/benefit-app/undefined/token
Status
404
Not Found
VersionHTTP/1.1
Transferred195 B (0 B size)
Referrer Policystrict-origin-when-cross-origin
Request PriorityHighest
DNS ResolutionSystem

Access-Control-Allow-Origin
http://localhost:5173
Connection
keep-alive
Content-Length
0
Date
Fri, 02 May 2025 10:00:16 GMT
Keep-Alive
timeout=5
Vary
Origin

Accept
/
Accept-Encoding
gzip, deflate, br, zstd
Accept-Language
en-US,en;q=0.5
Authorization
Basic dXNlcjp1c2Vy
Connection
keep-alive
Content-Length
0
Host
localhost:5173
Origin
http://localhost:5173
Priority
u=0
Referer
http://localhost:5173/benefit-app/login
Sec-Fetch-Dest
empty
Sec-Fetch-Mode
cors
Sec-Fetch-Site
same-origin
User-Agent
Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0

Login failed: Error: Error getting JWT in fetchJWT! Status: 404
fetchJWT authorization.ts:14
login LoginForm.tsx:28
React 23
main.tsx:10
authorization.ts:21:16
fetchJWT authorization.ts:21
login LoginForm.tsx:28
React 23
main.tsx:10

---

### While the user is logged in and VITE_API_URL is changed in a way that it won't work.

Error fetching projects: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data project.ts:25:16
Uncaught TypeError: projects is undefined
ProjectsProvider ProjectsProvider.tsx:29
React 11
workLoop scheduler.development.js:266
flushWork scheduler.development.js:239
performWorkUntilDeadline scheduler.development.js:533
js scheduler.development.js:571
js scheduler.development.js:633
__require chunk-EQCVQC35.js:9
js index.js:6
__require chunk-EQCVQC35.js:9
React 2
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
react-dom_client.js:38
ProjectsProvider.tsx:29:25
Uncaught TypeError: projects is undefined
ProjectsProvider ProjectsProvider.tsx:29
React 12
workLoop scheduler.development.js:266
flushWork scheduler.development.js:239
performWorkUntilDeadline scheduler.development.js:533
js scheduler.development.js:571
js scheduler.development.js:633
__require chunk-EQCVQC35.js:9
js index.js:6
__require chunk-EQCVQC35.js:9
React 2
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
react-dom_client.js:38
ProjectsProvider.tsx:29:25
The above error occurred in the component:

ProjectsProvider@http://localhost:5173/benefit-app/src/context/ProjectsProvider.tsx:22:41
AppUserProvider@http://localhost:5173/benefit-app/src/context/AppUserProvider.tsx:20:25

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries. react-dom.development.js:18704:14
Uncaught TypeError: projects is undefined
ProjectsProvider ProjectsProvider.tsx:29
React 9
workLoop scheduler.development.js:266
flushWork scheduler.development.js:239
performWorkUntilDeadline scheduler.development.js:533
js scheduler.development.js:571
js scheduler.development.js:633
__require chunk-EQCVQC35.js:9
js index.js:6
__require chunk-EQCVQC35.js:9
React 2
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
js React
__require chunk-EQCVQC35.js:9
react-dom_client.js:38