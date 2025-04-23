# Frontend Github Pages Deployment

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

Frontend can be deployed to Github pages by running following command while in the frontend project folder:

```sh
npm run deploy
```

## 3. Settings in GitHub

You can view and check GitHub Pages deployment changes in github repository **settings** and the **pages** section
