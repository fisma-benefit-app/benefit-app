# Backend Heroku Deployment

https://dashboard.heroku.com/apps/fisma-benefit-app

Backend urls look like this: https://fisma-benefit-app-f46bf93af467.herokuapp.com/

Logs:
```
heroku logs --tail --app fisma-benefit-app
```

## Deployment procedure

1. Backup the database before deployment.

2. Copy changes to repo. Currently we have to commit changes to repo https://github.com/loota/fisma-backend-alt by manually copying them from this main repo. This because Heroku wants the backend in the root directory.

3. Go to heroku and press *deploy*.
 
![updating backend by deploy branch](img/images_for_manuals/backend_heroku_deployment_updating_backend_by_deploy_branch.png)

----

## How the Heroku deployment was created 

### Requirements

- Heroku account (credit card needed for account)
- Email address
- Running database and its credentials (url, username and password)

## 1. Repository clone

### 1. Clone the repository

Clone the backend folder from the repository at https://github.com/loota/fisma-backend-alt.

### 2. Edit build.gradle file

Find the file build.gradle from the root of the file. In the following lines of the file, make sure the version is 21:

```
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

## 2. Heroku deployment

### 1. Create app

Navigate to your dashboard and click New -> Create new app.
Then enter your app's name and select Europe. Click Create app.

![create_app](img/images_for_manuals/backend_heroku_deployment_create_app.png)

### 2. Configure app settings

Navigate to settings.

![settings](img/images_for_manuals/backend_heroku_deployment_settings.png)

Click on Reveal Config Vars.

![config_vars](img/images_for_manuals/backend_heroku_deployment_config_vars.png)

Create Key-value pairs for the credentials of your database (username, password and url), where the key is one of the following datasource variables and the value is the actual value for your database:

![key_value_pairs](img/images_for_manuals/backend_heroku_deployment_key_value_pairs.png)

### 3. Configure GitHub-repository

Navigate to Deploy.

![deploy](img/images_for_manuals/backend_heroku_deployment_deploy.png)

Select GitHub as the deployment method.
Enter your repository name in the field and click search:

![deplopyment_method](img/images_for_manuals/backend_heroku_deployment_method.png)

If successful, you should see the app connecting to github:

![connected](img/images_for_manuals/backend_heroku_deployment_connection.png)

Select the correct branch and click Deploy Branch.

![deploy_branch](img/images_for_manuals/backend_heroku_deployment_deploy_branch.png)

### 4. Updating the backend

After commiting changes to the appopriate github repository, go back to heroku and press *deploy*.
the backend resides at https://github.com/loota/fisma-backend-alt

Currently we have to commit changes to that backend repo by manually copying them from this main repo.
 
![updating backend by deploy branch](img/images_for_manuals/backend_heroku_deployment_updating_backend_by_deploy_branch.png)

### 5. Set up Heroku CLI

Install heroku CLI from https://devcenter.heroku.com/articles/heroku-cli

In your console, enter 

```
heroku login
```

Accept the login prompt in your browser:

![heroku_login](img/images_for_manuals/backend_heroku_deployment_heroku_login.png)

To view detailed logs from your app, enter in your console:
```
heroku logs --tail --app fisma-benefit-app
```

Where `fisma-benefit-app` is the name you entered when creating the app.

