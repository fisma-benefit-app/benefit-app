## Why backend credentials are in separate repository.

Backend credentials are sperated from the public benefit-app
repository to the private backend-credentials repository.

This is due Heroku service can't read credentials from benefit-app repository.

The public benefit-app repository has currently a complex structure, which
makes the reading the correct credentials a difficult task for Heroku service.

Thus, we created separate private backend-credentials repository
in order Heroku able to read correct credentials faster.

Note that in Heroku, we have only the code.
