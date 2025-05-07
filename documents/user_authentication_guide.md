# User authentication guide

This is the manual Benefit-app's login functionality.
Here we present all essential files and codelines, 
also explaining logical structure  
for the login system in the Benefit-app.

The Benefit-app will login ... from what and where software, tool?

**A) User account's database and table.** 

We created tables for user account's attributes
and their type is *schema.sql* file, 
´create table if not exists app_user´ at codeline 3.

Image: Creating app.user -tabke in schema.sql file.

Then we manually stored values for id, name 
and password of user accounts in our *data.sql* 
file, *app_user* table at codeline 6.

![app user table in the data sql-file](img/images_for_manuals/data_sql_app_user_table.png)

Image: Inserting value to app.user -table in data.sql file.

**B) Handling user account's data in Java.**

In ´benefit-app\backend\src\main\java\fi\fisma\backend\appuser´ -directory,
we have following important files handling user account's data in Java:

* AppUser.java
* AppUserController.java
* AppUserRepository.java

AppUser.java has the constructor *AppUser*, which is used for ...

![img.png](img/images_for_manuals/Java_AppUser_constructor.png)
Image: AppUser.java

AppUserController.java controls...

![img.png](img/images_for_manuals/Java_AppUserController.png)
Image: AppUserController.java

AppUserRepository.java handles...

![img.png](img/images_for_manuals/Java_AppUserRepository.png)
Image: AppUserRepository.java


