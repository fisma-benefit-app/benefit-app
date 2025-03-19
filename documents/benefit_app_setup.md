# Setup for Benefit-app locally

## 1. Setup for booting up Benefit-app

In order to start Benefit-app locally,
here are prerequisites that must
be installed and activated in your workstation. 

---

**a) Tools' list.**

Here is list of tools, that are required to be installed
for Windows workstations in order to activate Benefit-app:

* Docker (e.g Docker Desktop version ___ or newer).
* Git Bash (Git --> version 2.45.2 or newer and Bash --> version 5.2.26(1) or newer).
* Java (e.g. OPENJDK version 17 or newer).
* Visual Studio Code (version 1.98.2 or newer).

For Mac and Linux workstation, we will report all necessary tools
in more detail sometime in future (WIP).

---

**b.1) Personal use: Fork the Benefit-app repository.**

If you only want run the application for only personal,
non-enterprise use without accidentally adding changes
any changes to current version, we _highly_ recommend
to fork the whole application in your local workstation.

You can find fork functionality up right corner of
benefit-app's github repo page:

  ![image](https://github.com/user-attachments/assets/eb5c1c43-af25-46ee-af7b-1313f4431824)
|---|



For more information about forking repositories in Github,
please read the official documents by Github:
https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo

---

**b.2) Corporate use: Clone the Benefit-app repository.**

If you are intending to continue and update the Benefit-app
repository for your corporation, then you can clone 
the benefit-app repository into your workstation
with following clone command:

`git clone https://github.com/fisma-benefit-app/benefit-app.git` 

The command should work in any git supported softwares or tools.
Most of us used _Git Bash_ for installing and updating
benefit-app repository in Windows workstations.

![image](https://github.com/user-attachments/assets/6f05f526-0235-4405-a561-c825763d7ef3)




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
