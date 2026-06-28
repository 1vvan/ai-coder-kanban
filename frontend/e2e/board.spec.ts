import { test, expect, type Page, type Locator } from "@playwright/test";

function column(page: Page, name: string): Locator {
  return page.locator("section").filter({
    has: page.getByRole("button", { name: new RegExp(`^${name}`) }),
  });
}

async function dragCardTo(page: Page, card: Locator, target: Locator) {
  const cb = (await card.boundingBox())!;
  const tb = (await target.boundingBox())!;
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  await page.mouse.move(cb.x + cb.width / 2 + 20, cb.y + 10, { steps: 5 });
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, {
    steps: 12,
  });
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2 + 5, {
    steps: 3,
  });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Kanban Board" }),
  ).toBeVisible();
});

test("renders five columns", async ({ page }) => {
  await expect(page.locator("section")).toHaveCount(5);
});

test("adds a card to a column", async ({ page }) => {
  const todo = column(page, "To Do");
  await todo.getByRole("button", { name: "Add a card" }).click();
  await todo.getByLabel("Card title").fill("Write docs");
  await todo.getByLabel("Card description").fill("Cover setup steps");
  await todo.getByRole("button", { name: "Add card" }).click();

  await expect(todo.getByText("Write docs")).toBeVisible();
  await expect(todo.getByText("Cover setup steps")).toBeVisible();
});

test("deletes a card", async ({ page }) => {
  const card = page
    .locator("section div")
    .filter({ has: page.getByRole("heading", { name: "Design board layout" }) })
    .last();
  await card.hover();
  await card.getByRole("button", { name: "Delete card" }).click({ force: true });
  await expect(page.getByText("Design board layout")).toHaveCount(0);
});

test("renames a column", async ({ page }) => {
  await page.getByRole("button", { name: /^Backlog/ }).click();
  const input = page.getByLabel("Column title");
  await input.fill("Ideas");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: /^Ideas/ })).toBeVisible();
});

test("drags a card to another column", async ({ page }) => {
  const card = page.getByText("Research competitors", { exact: true });
  const done = column(page, "Done");
  await dragCardTo(page, card, done);

  await expect(done.getByText("Research competitors")).toBeVisible();
});
