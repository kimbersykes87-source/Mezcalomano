import { test, expect } from "@playwright/test";

test("shop pages load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mezcalomano - Discovery Deck" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
});
