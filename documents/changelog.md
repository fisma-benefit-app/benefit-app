# Sprint 9 (8.-28.9.2025) changes:

## Frontend:

- The frontend build or deployment will now fail if required environment variables are not set
- Fixed an incorrect formula in `calculations.ts`
- The new component now expands automatically when the “Collapse all” setting is enabled
- Component order can now be changed via drag and drop
- Component styling has been clarified
- As screen width increases, components can now be displayed side by side

## Backend:

- Removed dead AWS-related code
- Architecture has been split into more readable packages: `api`, `domain`, `repository`, and `service`
- Added `GlobalExceptionHandler`
- Tests updated to use the new architecture and the `StandaloneSetup` helper class for data management

## CI/CD:

- Added formatting and linting checks, as well as tests to GitHub Actions, which now run automatically on pull requests
- Added a pre-commit hook to automatically format code on every commit
- Added testing environments on both Heroku and GitHub Pages

## Documentation:

- Updated README`
- Added LICENSE (MIT)
- Other documentation has been organized into clear subcategories: `guides`, `references`, `notes`
  - `guides`: Instructions describing parts or processes of the software
  - `references`: Detailed technical descriptions, e.g., API documentation
  - `notes`: “Good to know” files
- Combined and updated separate deployment instructions for frontend and backend
- Documented user authentication, application logging, branching strategy, and software deployment (`documents/guides`)
- All old files (including the old README) moved to the `archive` folder

## Other:

- The team has adopted a branching strategy to support smooth collaboration
