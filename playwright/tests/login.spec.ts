import { expect, test } from "@playwright/test";

const LOGIN_URL = `${process.env.E2E_BASE_URL ?? "http://localhost:5173"}/benefit-app/#/login`;

const USERNAME = process.env.E2E_USERNAME ?? "user";
const PASSWORD = process.env.E2E_PASSWORD ?? "user";

test.describe("login", () => {
  test.beforeEach(async ({ page }) => {
    // The UI language comes from localStorage; pin it to English so the selectors below match.
    await page.addInitScript(() => {
      localStorage.setItem("languagePreference", "en");
    });
    await page.goto(LOGIN_URL);
  });

  test("shows the login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByPlaceholder("Username")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("logs in with valid credentials and lands on the project list", async ({
    page,
  }) => {
    await page.getByPlaceholder("Username").fill(USERNAME);
    await page.getByPlaceholder("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).not.toHaveURL(/#\/login/);
    await expect(
      page.getByPlaceholder("Find a project by name..."),
    ).toBeVisible();
    // The header shows the logged-in username.
    await expect(page.getByText(USERNAME, { exact: true })).toBeVisible();
  });
});