# User authentication guide

This is the manual Benefit-app's login functionality.
Here we present all essential files and codelines, 
also explaining logical structure  
for the login system in the Benefit-app.

**A) User account's database and table.**

In the ´benefit-app\backend\src\main\resources´ -directory
you can find the essential sql files of Benefit-app's users.

We created tables for user account's attributes
and their type is *schema.sql* file, i.e.
´create table if not exists app_user´ at codeline 3.

![creating app user table in the schema sql-file](img/images_for_manuals/schema_sql_app_user_creation.png)

Image: Creating app.user -table in schema.sql file.

Then we manually stored values for id, name 
and password of user accounts in our *data.sql* 
file, i.e. *app_user* table at codeline 6.

![app user table in the data sql-file](img/images_for_manuals/data_sql_app_user_table.png)

Image: Inserting value to app.user -table in data.sql file.

**B) Handling user account's data in Java.**

In ´benefit-app\backend\src\main\java\fi\fisma\backend\appuser´ -directory,
we have following important files handling user account's data in Java:

* AppUser.java
* AppUserController.java
* AppUserRepository.java

AppUser.java has the constructor *AppUser* with three essential
variables: **id**, **username** and **password**.

![img.png](img/images_for_manuals/Java_AppUser_constructor.png)
Image: AppUser.java

AppUserController.java has functionalities such as updating password
for a AppUser and deleting a AppUser.

![img.png](img/images_for_manuals/Java_AppUserController.png)
Image: AppUserController.java

AppUserRepository.java has method for finding a AppUser by their username. 

![img.png](img/images_for_manuals/Java_AppUserRepository.png)
Image: AppUserRepository.java

**C) TODO: Give a more precise description how the login tokens are handled during user login session, from which database to which API endpoint.**