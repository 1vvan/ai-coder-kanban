import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("unauthenticated visit shows the login form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kanban Board" }),
  ).toHaveCount(0);
});

test("wrong credentials are rejected", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("nope");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

test("valid login reveals the board, logout re-gates it", async ({ page }) => {
  await login(page);
  await expect(page.locator("section")).toHaveCount(5);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
