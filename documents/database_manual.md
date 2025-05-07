# Database manual

This is manual for Benefit-app's staging -database.

1) Where is database published?

It was deployed to Heroku platform.
Please read more from


1) How to access database from my Windows?

You need to install latest version of PostgreSQL DBMS in your workstation via e.g. installer from official PostgreSQL website:
https://www.postgresql.org/

Our group had 17.4.2 version during development cycle.

The software is called SQL Shell in your Windows. You can activate it 
via terminal:

```
psql
```

Then you have insert credentials to access staging -database.

2) Where are credentials?

See README.md documentation from backend-credentials -repository on 
fisma-benefit-app organisation at Github.

Canonically, the credentials can be also found from Heroku.
First go data.heroku.com and login with Heroku credentials.

Then move to Add-On Services section and click "Heroku Postgres" -service from the Heroku dashboard.

Lastly move from Overview to Settings -tab, move then to ADMINISTRATION -> Database Credentials section and click finally "View Credentials" -button. 

In the terminal, add Host credentials in server location:
```
Server [localhost]: [INSERT Host]
```

Second, add Database credentials in database section:
```
Database [postgres] : [INSERT Database]
```

Third, add Port credentials in port section:
```
Port [5432] : [INSERT Port]
```

Fourth, add User credentials in username section:
```
Username: [Insert User]
```

Fifth and final, add Password in 


X) How to dump data into database from my Windows?

You need logout 

X) How to import data?

X) Where are sql files in the database?

