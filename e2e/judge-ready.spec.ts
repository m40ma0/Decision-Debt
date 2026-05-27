import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL ?? "test@gmail.com";
const password = process.env.E2E_PASSWORD ?? "123456";
const createdTitle = "Choose final review focus";

async function login(page: Page) {
  await page.goto("/login");
  if (page.url().includes("/dashboard")) return;

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
}

async function ensureDemoData(page: Page) {
  await page.goto("/dashboard");
  const loadDemo = page.getByRole("button", { name: "Load Demo" });
  if (await loadDemo.isVisible().catch(() => false)) {
    await loadDemo.click();
    await expect(
      page.getByRole("button", { name: /Demo data already loaded|Loading/i })
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
  }
}

async function removeCreatedDecision(page: Page) {
  await page.goto("/decisions");
  await page.getByPlaceholder("Search decisions").fill(createdTitle);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const rowLink = page.getByRole("link", { name: new RegExp(createdTitle, "i") });
    if ((await rowLink.count()) === 0) return;

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.waitForTimeout(600);
  }
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("login and dashboard load", async ({ page }) => {
  await ensureDemoData(page);
  await expect(page.getByRole("heading", { name: "Decision Debt" })).toBeVisible();
  await expect(page.getByText(/TEST QA|browser test|timestamp/i)).toHaveCount(0);
});

test("mobile menu opens, closes, and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New Decision" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();

  await page.getByRole("link", { name: "Inbox" }).click();
  await page.waitForURL("**/decisions");
  await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible();

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
});

test("create decision redirects to detail and delete confirmation works", async ({ page }) => {
  await removeCreatedDecision(page);

  await page.goto("/decisions/new");
  await page.getByLabel("Title").fill(createdTitle);
  await page
    .getByLabel("Description")
    .fill("Decide what to polish before the final hackathon review.");
  await page.getByLabel("Category").selectOption("work");
  await page.getByLabel("Stakes").selectOption("high");

  await page.getByRole("button", { name: "Create Decision" }).click();
  await expect(
    page.getByRole("button", { name: /Creating decision|Decision created/i })
  ).toBeVisible();
  await page.waitForURL(/\/decisions\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: createdTitle })).toBeVisible();
  await expect(page.getByText("Why this score?")).toBeVisible();

  await removeCreatedDecision(page);
  await expect(page.getByText("No matches.")).toBeVisible();
});

test("search, filter, and open detail score explanation", async ({ page }) => {
  await ensureDemoData(page);
  await page.goto("/decisions");
  await page.getByPlaceholder("Search decisions").fill("Design4Future");
  await page.getByLabel("Category").selectOption("work");
  await page
    .getByRole("link", { name: /Design4Future launch scope/i })
    .first()
    .click();
  await expect(page.getByText("Why this score?")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Options" })).toBeVisible();
});

test("review next and previous controls work", async ({ page }) => {
  await ensureDemoData(page);
  await page.goto("/review");
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Previous" })).toBeEnabled();
  await page.getByRole("button", { name: "Previous" }).click();
});

test("analytics renders useful states", async ({ page }) => {
  await ensureDemoData(page);
  await page.goto("/analytics");
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(page.getByText("Debt Trend")).toBeVisible();
  await expect(page.getByText("Debt reduced")).toBeVisible();
  await expect(page.getByText("No resolved data")).toHaveCount(0);
});
