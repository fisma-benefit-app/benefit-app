# Backend Heroku Deployment

https://dashboard.heroku.com/apps/fisma-benefit-app

Backend urls look like this: https://fisma-benefit-app-f46bf93af467.herokuapp.com/

Logs:
```
heroku logs --tail --app fisma-benefit-app
```

[Updating the Backend](#4-updating-the-backend)

## 1. Requirements

- Heroku account (credit card needed for account)
- Email address
- Running database and its credentials (url, username and password)

## 2. Repository clone

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

![create_app](https://github.com/user-attachments/assets/488a00e8-afd2-4e81-b447-d8cb1a0ab2f4)

### 2. Configure app settings

Navigate to settings.

![settings](https://github.com/user-attachments/assets/f691c7cd-d5db-4053-b6ca-c7e71a5f53e9)

Click on Reveal Config Vars.

![config_vars](https://github.com/user-attachments/assets/c2f02485-8848-4cc8-a8bd-bba06ce1ba50)

Create Key-value pairs for the credentials of your database (username, password and url), where the key is one of the following datasource variables and the value is the actual value for your database:

![key_value_pairs](https://github.com/user-attachments/assets/6abddcfb-a45a-4786-bd33-66d39061d1c7)

### 3. Configure GitHub-repository

Navigate to Deploy.

![deploy](https://github.com/user-attachments/assets/be709d52-c8dc-4aea-8f89-cb09398cbf54)

Select GitHub as the deployment method.
Enter your repository name in the field and click search:

![deplopyment_method](https://github.com/user-attachments/assets/87301025-fe9b-4633-be82-2135a8b2276b)

If successful, you should see the app connecting to github:

![connected](https://github.com/user-attachments/assets/8dfc8207-ba6d-4ec2-8855-be8014b69346)

Select the correct branch and click Deploy Branch.

![deploy_branch](https://github.com/user-attachments/assets/e0c7c4aa-78d8-4d2e-8fdf-3c8d3ab6f543)

### 4. Updating the backend

After commiting changes to the appopriate github repository, go back to heroku and press *deploy*.
the backend resides at https://github.com/loota/fisma-backend-alt

Currently we have to commit changes to that backend repo by manually copying them from this main repo.
 
![image](https://github.com/user-attachments/assets/6e87f070-c6a4-40c8-95ff-dde14bcbd6de)


### 5. Set up Heroku CLI

Install heroku CLI from https://devcenter.heroku.com/articles/heroku-cli

In your console, enter 

```
heroku login
```

Accept the login prompt in your browser:

![heroku_login](https://github.com/user-attachments/assets/c821ff72-7371-4dcb-92db-f140d1df1904)

To view detailed logs from your app, enter in your console:
```
heroku logs --tail --app fisma-benefit-app
```

Where `fisma-benefit-app` is the name you entered when creating the app.

