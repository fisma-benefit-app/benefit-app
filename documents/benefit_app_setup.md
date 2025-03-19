# Setup for Benefit-app locally

## 1. Setup for booting up Benefit-app

In order to start Benefit-app locally,
here are prerequisites that must
be installed and activated in your workstation. 

**a.1) Personal use: Fork the Benefit-app repository.**

If you only want run the application for only personal,
non-enterprise use without accidentally adding changes
any changes to current version, we _highly_ recommend
to fork the whole application in your local workstation.

You can find fork functionality up right corner of
benefit-app's github repo page:
![image](https://github.com/user-attachments/assets/eb5c1c43-af25-46ee-af7b-1313f4431824)

For more information about forking repositories in Github,
please read the official documents by Github:
https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo

**a.2) Corporate use: Clone the Benefit-app repository.**

activated docker compose for postgresql 
with command docker compose up -d in ./benefit-app directory.


b) activated backend's java with gradle 
with java -jar command on backend-0.0.1-SNAPSHOT.jar 
in ./benefit-app/backend/build/libs directory.


c) installed all node libraries with npm install
and then activated frontend with npm run dev command
in ./benefit-app/frontend directory.

Please read "Setting up application" manual for more information.

After setting up all above mentioned steps, you should have
equilavent page as below picture:
ADD IMAGE
