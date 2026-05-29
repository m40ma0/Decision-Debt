# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: judge-ready.spec.ts >> search, filter, and open detail score explanation
- Location: e2e/judge-ready.spec.ts:99:5

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /Design4Future launch scope/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "Decision Debt test@gmail.com" [ref=e5] [cursor=pointer]:
          - /url: /dashboard
          - paragraph [ref=e6]: Decision Debt
          - paragraph [ref=e7]: test@gmail.com
        - button "Menu" [ref=e9] [cursor=pointer]:
          - img [ref=e10]
          - text: Menu
    - main [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]:
            - paragraph [ref=e16]: Inbox
            - heading "Decisions" [level=1] [ref=e17]
          - link "New Decision" [ref=e18] [cursor=pointer]:
            - /url: /decisions/new
            - img [ref=e19]
            - text: New Decision
        - generic [ref=e20]:
          - generic [ref=e22]:
            - generic [ref=e23]:
              - img
              - textbox "Search decisions" [active] [ref=e24]: Design4Future
            - combobox "Status" [ref=e25]:
              - option "All statuses" [selected]
              - option "Open"
              - option "Committed"
              - option "Deferred"
              - option "Delegated"
              - option "Deleted"
            - combobox "Category" [ref=e26]:
              - option "All categories"
              - option "Work" [selected]
              - option "School"
              - option "Money"
              - option "Health"
              - option "Relationships"
              - option "Personal"
              - option "Other"
            - combobox "Score" [ref=e27]:
              - option "All scores" [selected]
              - option "Low"
              - option "Medium"
              - option "High"
              - option "Critical"
            - combobox "Sort" [ref=e28]:
              - option "Sort by score" [selected]
              - option "Sort by deadline"
              - option "Sort by age"
              - option "Sort by category"
          - generic [ref=e30]: No matches.
  - alert [ref=e31]
```

# Test source

```ts
  7   | async function login(page: Page) {
  8   |   await page.goto("/login");
  9   |   if (page.url().includes("/dashboard")) return;
  10  | 
  11  |   await page.getByLabel("Email").fill(email);
  12  |   await page.getByLabel("Password").fill(password);
  13  |   await page.getByRole("button", { name: "Log in" }).click();
  14  |   await page.waitForURL("**/dashboard");
  15  | }
  16  | 
  17  | async function ensureDemoData(page: Page) {
  18  |   await page.goto("/dashboard");
  19  |   const loadDemo = page.getByRole("button", { name: "Load Demo" });
  20  |   if (await loadDemo.isVisible().catch(() => false)) {
  21  |     await loadDemo.click();
  22  |     await expect(
  23  |       page.getByRole("button", { name: /Demo data already loaded|Loading/i })
  24  |     ).toBeVisible();
  25  |     await page.waitForLoadState("networkidle");
  26  |   }
  27  | }
  28  | 
  29  | async function removeCreatedDecision(page: Page) {
  30  |   await page.goto("/decisions");
  31  |   await page.getByPlaceholder("Search decisions").fill(createdTitle);
  32  | 
  33  |   for (let attempt = 0; attempt < 8; attempt += 1) {
  34  |     const rowLink = page.getByRole("link", { name: new RegExp(createdTitle, "i") });
  35  |     if ((await rowLink.count()) === 0) return;
  36  | 
  37  |     page.once("dialog", (dialog) => dialog.accept());
  38  |     await page.getByRole("button", { name: "Delete" }).first().click();
  39  |     await page.waitForTimeout(600);
  40  |   }
  41  | }
  42  | 
  43  | test.describe.configure({ mode: "serial" });
  44  | 
  45  | test.beforeEach(async ({ page }) => {
  46  |   await login(page);
  47  | });
  48  | 
  49  | test("login and dashboard load", async ({ page }) => {
  50  |   await ensureDemoData(page);
  51  |   await expect(page.getByRole("heading", { name: "Decision Debt" })).toBeVisible();
  52  |   await expect(page.getByText(/TEST QA|browser test|timestamp/i)).toHaveCount(0);
  53  | });
  54  | 
  55  | test("mobile menu opens, closes, and navigates", async ({ page }) => {
  56  |   await page.setViewportSize({ width: 390, height: 844 });
  57  |   await page.goto("/dashboard");
  58  | 
  59  |   await page.getByRole("button", { name: "Menu" }).click();
  60  |   await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  61  |   await expect(page.getByRole("link", { name: "New Decision" })).toBeVisible();
  62  |   await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  63  | 
  64  |   await page.getByRole("link", { name: "Inbox" }).click();
  65  |   await page.waitForURL("**/decisions");
  66  |   await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible();
  67  | 
  68  |   await page.getByRole("button", { name: "Menu" }).click();
  69  |   await page.getByRole("button", { name: "Close navigation" }).click();
  70  |   await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  71  | });
  72  | 
  73  | test("create decision redirects to detail and delete confirmation works", async ({ page }) => {
  74  |   await removeCreatedDecision(page);
  75  | 
  76  |   await page.goto("/decisions/new");
  77  |   await page.getByLabel("Title").fill(createdTitle);
  78  |   await page
  79  |     .getByLabel("Description")
  80  |     .fill("Decide what to polish before the final hackathon review.");
  81  |   await page.getByLabel("Category").selectOption("work");
  82  |   await page.getByLabel("Stakes").selectOption("high");
  83  | 
  84  |   await page.getByRole("button", { name: "Create Decision" }).click();
  85  |   await expect(
  86  |     page.getByRole("button", { name: /Creating decision|Decision created/i })
  87  |   ).toBeVisible();
  88  |   await page.waitForURL(/\/decisions\/[0-9a-f-]+$/);
  89  |   await expect(page.getByRole("heading", { name: createdTitle })).toBeVisible();
  90  |   await expect(page.getByText("Why this score?")).toBeVisible();
  91  | 
  92  |   await removeCreatedDecision(page);
  93  |   await page.getByPlaceholder("Search decisions").fill(createdTitle);
  94  |   await expect(
  95  |     page.getByRole("link", { name: new RegExp(createdTitle, "i") })
  96  |   ).toHaveCount(0);
  97  | });
  98  | 
  99  | test("search, filter, and open detail score explanation", async ({ page }) => {
  100 |   await ensureDemoData(page);
  101 |   await page.goto("/decisions");
  102 |   await page.getByPlaceholder("Search decisions").fill("Design4Future");
  103 |   await page.getByLabel("Category").selectOption("work");
  104 |   await page
  105 |     .getByRole("link", { name: /Design4Future launch scope/i })
  106 |     .first()
> 107 |     .click();
      |      ^ Error: locator.click: Test timeout of 45000ms exceeded.
  108 |   await expect(page.getByText("Why this score?")).toBeVisible();
  109 |   await expect(page.getByRole("tab", { name: "Options" })).toBeVisible();
  110 | });
  111 | 
  112 | test("review next and previous controls work", async ({ page }) => {
  113 |   await ensureDemoData(page);
  114 |   await page.goto("/review");
  115 |   await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  116 |   await page.getByRole("button", { name: "Next" }).click();
  117 |   await expect(page.getByRole("button", { name: "Previous" })).toBeEnabled();
  118 |   await page.getByRole("button", { name: "Previous" }).click();
  119 | });
  120 | 
  121 | test("analytics renders useful states", async ({ page }) => {
  122 |   await ensureDemoData(page);
  123 |   await page.goto("/analytics");
  124 |   await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  125 |   await expect(page.getByText("Debt Trend")).toBeVisible();
  126 |   await expect(page.getByText("Debt reduced")).toBeVisible();
  127 |   await expect(page.getByText("No resolved data")).toHaveCount(0);
  128 | });
  129 | 
```