import { type Page, expect } from "@playwright/test";
import { createInitialState } from "../lib/seed";

export async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Kanban Board" }),
  ).toBeVisible();
}

/** Reset the persisted board to the seed state so tests start clean. */
export async function resetBoard(page: Page) {
  const res = await page.request.put("/api/board", {
    data: createInitialState(),
  });
  expect(res.ok()).toBeTruthy();
}
