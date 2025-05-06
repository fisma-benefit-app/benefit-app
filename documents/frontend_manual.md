# Benefit App frontend

## 1. Instructions for setting frontend up locally

**1.** Clone the repository:

```sh
git clone https://github.com/fisma-benefit-app/benefit-app.git
```

**2.** Setup and run the spring boot backend (see **backend_setup_manula** -documentation:
https://github.com/fisma-benefit-app/benefit-app/blob/dev/documents/backend_setup_manual.md).

**3.** Navigate to frontend project root via command:

```sh
cd benefit-app/frontend`
```

**4.** Install frontend dependencies:

```sh
npm install
```

You can check all installed dependencies
via command:

```sh
npm ls
```

You should have following dependencies
installed in the frontend:

* @eslint/js@9.18.0
* @fortawesome/fontawesome-svg-core@6.7.2
* @fortawesome/free-solid-svg-icons@6.7.2
* @fortawesome/react-fontawesome@0.2.2
* @tailwindcss/vite@4.0.0
* @types/react-dom@18.3.5
* @types/react@18.3.18
* @vitejs/plugin-react@4.3.4
* eslint-plugin-react-hooks@5.1.0
* eslint-plugin-react-refresh@0.4.18
* eslint@9.18.0
* frontend@0.0.0 -> .\
* globals@15.14.0
* prettier@3.4.2
* react-dom@18.3.1
* react-router@7.1.3
* react@18.3.1
* tailwindcss@4.0.0
* typescript-eslint@8.21.0
* typescript@5.6.3
* vite@6.0.11

**5.** Setup environment variables:

1. Create a file called .env in the frontend project root.
2. Add the following environment variable: VITE_API_URL. Its value should match the locally running backend development server URL.

e.g.

```sh
VITE_API_URL = http://localhost:8080
```

**6.** Start the frontend development server:

```sh
npm run dev
```

**7.** Opening the application in web browser:

Open the Benefit-app's frontend in web browser
via following URL:

´http://localhost:5173/login´

You should get similar web page as the below picture:

![UI of login page for Benefit-app.](./img/images_for_manuals/UI_login_page.png)



## 2. Components

FunctionalClassComponent.tsx

- Represents a singular functional component in a project, contains the ui for representing component data and the inputs for editing and deleting it.

FunctionalPointSummary.tsx

- Component which shows a summary of the points for each functional component in a project and their sum.

ProjectList.tsx

- Component which displays all the projects a user has in table format and allows the user to navigate to their respective pages. This is currently the main page of the application.

ProjectPage.tsx

- Page that shows the data for a specific project. Functional components of the project are mapped to the page using FunctionalClassComponent.tsx and the summary of the component points is shown using FunctionalPointSummary.tsx. Has buttons for saving the project, adding a new functional component to it, and saving project version as well as a dropdown menu for selecting project version.

## 3. Lib Files

fc-constants.ts

- Helper arrays/objects for FunctionalClassComponent.tsx e.g. arrays containing available component types based on on selected component class.

fc-service-functions.ts

- Helper functions for FunctionalClassComponent.tsx e.g. function for getting correct calculation function depending on selected component class.

printUtils.ts

- Contains functions for creating csv and pdf -files based on project data.

## 4. Context Files

AppUserProvider.tsx

- Servers user info, token and logged in state to the application.

ProjectsProvider.tsx

- Serves all user's projects to the application and some functions for handling projects like function for checking projects latest version, which the version control feature relies on.

## 5. Frameworks/Third-Party Libraries

### Font Awesome

- https://fontawesome.com/

- Used for the UI icons.

### React Router

- https://reactrouter.com/

- Used for creating the routing logic and navigation in this single-page application.

### Tailwind CSS

- https://tailwindcss.com/

- "Utility" based CSS framework used to write CSS in this project.
