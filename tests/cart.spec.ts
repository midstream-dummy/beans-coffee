import { test, expect } from "@playwright/test";
import { midstreamScene } from "@midstream/sdk/playwright";

test("shopper sees the items in their cart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("link", { name: "Keep shopping" }).click();
  await page.getByRole("button", { name: "Add to cart" }).nth(1).click();

  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Espresso Beans" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Filter Roast" })).toBeVisible();

  await midstreamScene(page, "cart-with-items");
});

test("shopper browses the shop", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Fresh beans, roasted weekly" }),
  ).toBeVisible();

  await midstreamScene(page, "shop-front");
});
