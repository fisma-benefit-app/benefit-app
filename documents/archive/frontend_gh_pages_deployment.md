# Frontend Github Pages Deployment

https://github.com/fisma-benefit-app/benefit-app/settings/pages

### Build log

See Github Actions https://github.com/fisma-benefit-app/benefit-app/actions
The rows with comment "pages build and deployment"

## 1. Configuration

### 1. vite.config.js

```
export default defineConfig({
  base: "/benefit-app/",
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

The **base** property specifies the base public path where the app is be served from. For Github Pages this must be set to the project repository name.

### 2. package.json

The frontend uses the gh-pages npm package which is used to deploy the application to Github Pages from command line.

```
"devDependencies": {
    "gh-pages": "^6.3.0",
}
```

Deployment scripts:

```
 "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
```

- predeploy builds the project into the dist folder.

- deploy publishes the contents of dist to the gh-pages branch.

## 2. Deployment

Application is built locally, so you need to run _npm install_ first

Note: Before deploying you should have the environment variable **VITE_API_URL** in the file

frontend/.env.production

and its value should match the backend server address. When frontend is built and deployed, Vite substitutes environment variable values in the code. Here you need to have the backend url.

.env.production:

```sh
VITE_API_URL = https://fisma-benefit-app-XXXXXXXXX.herokuapp.com
```

Frontend can be deployed to Github pages by running following command while in the frontend project folder:

```sh
npm run deploy
```

## 3. Settings in GitHub

You can view and check GitHub Pages deployment changes in github repository **settings** and the **pages** section

![image](img/images_for_manuals/github_pages_deployment.png)
