import { test, expect } from "@playwright/test";
import { login, resetBoard } from "./helpers";

// Hits the live AI (free tier: slow + rate-limited), so allow generous time.
// Runs serially and resets board state between tests.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  await login(page);
  await resetBoard(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Kanban Board" }),
  ).toBeVisible();
});

test("chat sidebar is visible", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "AI Assistant" }),
  ).toBeVisible();
});

test("AI message adds a card and the board refreshes automatically", async ({
  page,
}) => {
  await page
    .getByLabel("Chat message")
    .fill('Add a card titled "Buy milk" to the To Do column');
  await page.getByRole("button", { name: "Send" }).click();

  // The new card appears in the board without a manual reload, and the AI's
  // reply appears in the chat.
  await expect(
    page.locator("section").getByText("Buy milk", { exact: false }),
  ).toBeVisible({ timeout: 60000 });
  await expect(page.locator("aside").getByText(/.+/).last()).toBeVisible();
});
