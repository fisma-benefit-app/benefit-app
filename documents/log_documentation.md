# Benefit App Backend Logs

**1.** Install Heroku CLI by following instructions from:

```sh
https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
```

**2.** Open Terminal and type:
```sh
heroku login
```

Then browser window opens and asks you to login with Heroku Credentials

**3.** Run following command to get access to Heroku app logs:

```sh
heroku logs --app fisma-benefit-app --tail
```
