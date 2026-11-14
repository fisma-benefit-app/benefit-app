import { expect, test, type Page } from "@playwright/test";

const LOGIN_URL = process.env.SCALINGO_E2E_LOGIN_URL || "http://localhost:5173/benefit-app/#/login";

const USERNAME = process.env.SCALINGO_E2E_TEST_USERNAME || "user";
const PASSWORD = process.env.SCALINGO_E2E_TEST_PASSWORD || "user";

// Unique project name for every run.
const PROJECT_NAME = `e2e-project-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

async function login(page: Page) {
    await page.getByPlaceholder("Username").fill(USERNAME);
    await page.getByPlaceholder("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByPlaceholder("Find a project by name...")).toBeVisible();
}

async function openProject(page: Page) {
    await page.getByPlaceholder("Find a project by name...").fill(PROJECT_NAME);
    const row = page.locator("tr", { hasText: PROJECT_NAME });
    await expect(row).toHaveCount(1);
    await row.getByRole("link", { name: PROJECT_NAME }).click();
    await expect(page).toHaveURL(/#\/project\/\d+/);
}

const componentCards = (page: Page) => page.locator("[data-masonry-item]");

const NO_COMPONENTS_TEXT =
    "No components to show. Add some components using the button above on the right.";

// The delete test depends on the project the create test made, so the two run in order
// in one worker (the config has fullyParallel: true).
test.describe.configure({ mode: "serial" });

test.describe("project lifecycle", () => {
    test.beforeEach(async ({ page }) => {
        // The UI language comes from localStorage; pin it to English so the selectors match.
        await page.addInitScript(() => {
            localStorage.setItem("languagePreference", "en");
        });
        await page.goto(LOGIN_URL);
        await login(page);
    });

    test("creates a new blank project", async ({ page }) => {
        // The header button is icon-only; it has the title "New Project".
        await page.getByTitle("New Project").click();

        await expect(
            page.getByRole("heading", { name: "Create a new project" }),
        ).toBeVisible();

        // Selection view -> "create blank project" view
        await page.getByRole("button", { name: "Create new" }).click();

        await page.getByPlaceholder("Name the project").fill(PROJECT_NAME);
        await page.getByRole("button", { name: "Create new" }).click();

        // After creating, the app navigates to the new project's page.
        await expect(page).toHaveURL(/#\/project\/\d+/);
        await expect(page.getByText(PROJECT_NAME, { exact: true })).toBeVisible();

        // And the project shows up in the project list.
        await page.getByTitle("Home").click();
        await page.getByPlaceholder("Find a project by name...").fill(PROJECT_NAME);
        await expect(
            page.locator("tr", { hasText: PROJECT_NAME }),
        ).toHaveCount(1);
    });

    test("creates a functional component in the project", async ({ page }) => {
        await openProject(page);

        // A blank project starts without components.
        await expect(page.getByText(NO_COMPONENTS_TEXT)).toBeVisible();
        await expect(componentCards(page)).toHaveCount(0);

        await page.getByRole("button", { name: "New Functional Component" }).click();

        await expect(
            page.getByText("New functional component created successfully"),
        ).toBeVisible();
        await expect(componentCards(page)).toHaveCount(1);
        await expect(page.getByText(NO_COMPONENTS_TEXT)).toHaveCount(0);
    });

    test("deletes the functional component that was created", async ({ page }) => {
        await openProject(page);

        const card = componentCards(page);
        await expect(card).toHaveCount(1);

        await card.getByTitle("Collapse/Expand component").click();
        await card.getByTitle("Delete component").click();

        await expect(
            page.getByRole("heading", {
                name: "Are you sure you want to delete component?",
            }),
        ).toBeVisible();
        await page.getByRole("button", { name: "Confirm" }).click();

        await expect(page.getByText("Functional component deleted")).toBeVisible();
        await expect(componentCards(page)).toHaveCount(0);
        await expect(page.getByText(NO_COMPONENTS_TEXT)).toBeVisible();

        await page.reload();
        await expect(page.getByText(PROJECT_NAME, { exact: true })).toBeVisible();
        await expect(componentCards(page)).toHaveCount(0);
        await expect(page.getByText(NO_COMPONENTS_TEXT)).toBeVisible();
    });

    test("deletes the project that was created", async ({ page }) => {
        // Narrow the list to the project so the test doesn't depend on how many others exist.
        await page.getByPlaceholder("Find a project by name...").fill(PROJECT_NAME);
        // Rows have role="button", so locate them by tag rather than by the "row" role.
        const row = page.locator("tr", { hasText: PROJECT_NAME });
        await expect(row).toHaveCount(1);

        await row.getByTitle("Delete").click();

        await expect(
            page.getByRole("heading", {
                name: `Are you sure you want to delete project "${PROJECT_NAME}"?`,
            }),
        ).toBeVisible();
        await page.getByRole("button", { name: "Confirm" }).click();

        await expect(page.locator("tr", { hasText: PROJECT_NAME })).toHaveCount(0);
        await expect(page.getByText("No projects could be found.")).toBeVisible();
    });

    test("project is deleted not just locally", async ({ page }) => {
        await page.getByPlaceholder("Find a project by name...").fill(PROJECT_NAME);
        await expect(page.locator("tr", { hasText: PROJECT_NAME })).toHaveCount(0);
    });
});