# Benefit-app backend

## 1. Setup for booting up Benefit-app's backend locally

In order to start Benefit-app's backend locally,
here are prerequisites that must
be installed and activated in your workstation. 


---

**a) Tools' list.**

Here is list of tools, that are required to be installed
for Windows workstations in order to activate Benefit-app:

* Docker (e.g Docker Desktop version 4.39.0 (184744) or newer).
* Git Bash (Git --> version 2.45.2 or newer and Bash --> version 5.2.26(1) or newer).
* Java (e.g. OPENJDK version 17 or newer).
* Visual Studio Code (version 1.98.2 or newer).

For Mac and Linux workstation, we will report all necessary tools
in more detail sometime in future (WIP).

---

**b.1) Personal use: Fork the Benefit-app repository.**

If you only want run the application for only personal,
non-enterprise use without accidentally adding changes
any changes to current version of the official repository, 
we _highly_ recommend to fork the whole application 
in your local workstation.

You need to your own Github account in order to fork
the repository for own use. 

You can find fork functionality up right corner of
benefit-app's github repo page:

![image](https://github.com/user-attachments/assets/c0393515-9251-432a-977f-e1db90f5be6f)
|---|


For more information about forking repositories in Github,
please read the official documents by Github:
https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo

---

**b.2) Corporate use: Clone the Benefit-app repository.**

If you are intending to continue and update the Benefit-app
repository for the Fisma Ry, then you can clone 
the benefit-app repository into your workstation
with following clone command:

```sh
git clone https://github.com/fisma-benefit-app/benefit-app.git
```

The command should work in any git supported softwares or tools.
Most of us used _Git Bash_ for installing and updating
benefit-app repository in Windows workstations.

<img src="https://github.com/user-attachments/assets/38be504e-d0e8-481a-be45-5c5405bcddb3" width="450px" height="300px">

---

**c) Activate CLI tool (i.e. open the terminal).**

For following steps, you need to activate Command Line Interface -tool (CLI),
or open the terminal, in your workstation. CLI will be used for running database, 
docker, building application.

In your Windows workstation, you can use any CLI tools you like.
In our group, we used following CLIs in our project:

*Powershell
*Visual Studio Code's terminal
*Windows Terminal

---

**d) Activate PostgreSQL via Docker.**

///

*Note:* In the following instructions, `Drive:/path/to/benefit-app/backend`
is a placeholder. Replace `Drive:` with your actual drive letter (depending
your workstation).

*Example*:
- Placeholder: `Drive:/path/to/benefit-app/backend`
- Windows: `C:/path/to/benefit-app/backend`

///

Move to the benefit-app's directory.

```sh
cd Drive:/path/to/benefit-app
```

[IMAGE: Directory in Visual Studio Code]

In the benefit-app directory, you will activate
PostgreSQL via Docker. The PostgreSQL is configured
in the compose.yaml -file.

[IMAGE: compose.yaml -file]

Therefore, make sure you have the Docker
is installed in your workstation,
e.g. Docker Desktop. You can check
that have the current version of Docker
installed via command

```sh
docker --version
```

[IMAGE: Docker desktop]

After all validations and checking,
you should able to active Postgresql
via docker compose's command

```sh
docker compose up -d
```


in the Drive:/path/to/benefit-app -directory.
Please note the last option `-d`, which
will run PostgreSQL's docker in background.
If you forgot write it, then you need to close
the CLI and reopen it again.

Alternatively, you can shut down docker via 
keybindings CTRL+C and run docker compose again.

---

**e.1) Validate Java version in your workstation.**

After activating PostgreSQL's docker,
move to backend of benefit-app:

```sh
cd Drive:/path/to/benefit-app/backend
```

In backend directory, you need to build 
Java application of benefit-app.
In order to build any Java application
in your Windows workstation, make sure
that you have first installed Java language
from official Java website.

You can check the current version of your Java
via command

```sh
java --version
```

[image: java version openjdk]

Additionally, make sure that you have also
set JAVA_HOME to the correct Java Installation Path.

///

According Cameron McKenzie from TheServerSide: 
"JAVA_HOME is an operating system (OS) environment
variable which can optionally be set after either the
Java Development Kit (JDK) or the Java Runtime Environment (JRE)
is installed. The JAVA_HOME environment variable points
to the file system location where the JDK or JRE was installed.
This variable should be configured on all OS's that have a Java
installation, including Windows, Ubuntu, Linux, Mac and Android." 

Source: https://www.theserverside.com/definition/JAVA_HOME

[image: JAVA_HOME example]

///

If you have not configured JAVA_HOME to actual location 
of where the JDK or JRE was installed, there is high 
propability that Benefit-app's java application
in backend will not run at all. Note that JAVA_HOME 
will **not** likely be automatically updated even after
installing Java in your computer.

Incorrect JAVA_HOME have caused at least one of our member
big headache for not able running Benefit-app's backend
at the beginning (the Java's error message were not 
helpful at all).

---

**e.2) Build Java application in the backend.**

After checking and validating both Java version and
JAVA_HOME variable's path, you need lastly check
build.gradle -file in the backend.

[IMAGE: build.gradle -file of Java language version]

Depending which version of Java you have installed
in your workstation, you must update code line 12:

```sh
languageVersion = JavaLanguageVersion.of([INSERT_NUMBER])
```

Note that [INSERT_NUMBER] is a placeholder, which
you add the version number of your installed Java.

In our group, couple of use had differ versions of
Java in our computers. Some of us had Java version 17,
therefore `languageVersion = JavaLanguageVersion.of(17)`,
while some had Java version 23, hence
`languageVersion = JavaLanguageVersion.of(23)`.

Incorrect Java version number in the code line
will cause errors in building phase.

///

When you checked and set the correct Java version number
in the codeline 12 inside build.grade -file, you can
start building the Java application in the CLI
via following Gradle command

```sh
./gradlew build
```

If build is a failure, you need still fix some
configurations in the backend (e.g. review your tools,
Java language, etc.). If build is a success,
continue next step.

**e.3) Run Java application in the backend.**

After successful build, move to following path

```sh
Drive:/path/to/benefit-app/backend/build/libs 
```

i.e. backend's builded libaries.

Here, you should have jar files builded in the current
directory. Either check in Visual Studio Code the directory
or in CLI via `ls` or `dir` -commands

To run the java application of Benefit app,
activate the correct jar file via command

```sh
java -jar .\backend-0.0.1-SNAPSHOT.jar
```

Then you should see Spring logo, Spring Boot version and other lines 
printing on your CLI.

To validate if your jar is successfully running,
the last line should be equivalent to following line
"INFO 22516 --- [backend] [           main] ''.'''''.backend.BackendApplication      
: Started BackendApplication in 8.051 seconds (process running for 8.908)"

This will indicate that you have now the Benefit-app's backend 
successfully up and running.

If don't get the last line, it is indication there is
error in the backend.

Please read frontend.md manual (https://github.com/fisma-benefit-app/benefit-app/blob/dev/documents/frontend.md) 
for instruction of activating Benefit-app's frontend.
