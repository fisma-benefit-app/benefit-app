# Benefit App frontend

## 1. Instructions for setting frontend up locally

1. Clone the repository:
    ```sh
    git clone https://github.com/fisma-benefit-app/benefit-app.git
    ```

2. Setup and run the spring boot backend (see backend documentation).

3. Navigate to frontend project root which is {repository directory}/frontend

4. Install frontend dependencies:
    ```sh
    npm install
    ```

5. Setup environment variables:
    1. Create a file called .env in the frontend project root.
    2. Add the following environment variable: VITE_API_URL. Its value should match the locally running backend development server URL e.g. VITE_API_URL = http://localhost:8080

6. Start the frontend development server:
    ```sh
    npm run dev
    ```

## 2. Components

FunctionalClassComponent.tsx

- Represents a singular functional component in a project, contains the ui for representing component data and the inputs for editing and deleting it.

FunctionalPointSummary.tsx

- Component which shows a summary of the points for each functional component in a project and their sum.

ProjectList.tsx

- Component which displays all the projects a user has in table format and allows the user to navigate to their respective pages. This is currently the main page of the application.

ProjectPage.tsx

- Page that shows the data for a specific project. Functional components of the project are mapped to the page using FunctionalClassComponent.tsx and the summary of the component points is shown using FunctionalPointSummary.tsx. Has buttons for saving the project and adding a new functional component to it.

## 3. Lib Files

fc-constants.ts

- Helper arrays/objects for FunctionalClassComponent.tsx e.g. arrays containing available component types based on on selected component class.

fc-empty-templates.ts

- Contains helper objects for resetting component properties in FunctionalClassComponent.tsx when user changes the component class.

fc-service-functions.ts

- Helper functions for FunctionalClassComponent.tsx e.g. function for getting correct calculation function depending on selected component class.

printUtils.ts

- Contains functions for creating csv and pdf -files based on project data.

## 4. Frameworks/Third-Party Libraries

### Font Awesome

- https://fontawesome.com/

- Used for the UI icons.

### React Router

- https://reactrouter.com/

- Used for creating the routing logic and navigation in this single-page application.

### Tailwind CSS

- https://tailwindcss.com/

- "Utility" based CSS framework used to write CSS in this project.