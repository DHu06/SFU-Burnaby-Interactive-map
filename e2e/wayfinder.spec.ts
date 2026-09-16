import { test, expect } from "@playwright/test";
test("plans a cross-building route and advances through directions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your campus. Your way." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "2D map", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/sfu-desktop.png" });
  await page.getByRole("button", { name: "Find my route" }).click();
  await expect(page.getByText("YOUR ROUTE IS READY")).toBeVisible();
  await page.getByRole("button", { name: "Start navigation" }).click();
  await expect(page.getByText(/Step 1 of/)).toBeVisible();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
  await page.getByRole("button", { name: "Exit", exact: true }).click();
  await page.getByRole("switch", { name: "Step-free route" }).click();
  await expect(page.getByText("YOUR ROUTE IS READY")).toHaveCount(0);
  await page.getByRole("button", { name: "Find my route" }).click();
  await expect(
    page.getByRole("button", { name: /Take the elevator to level 1/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Take the elevator to level 1/ })
    .click();
  await expect(
    page.getByRole("button", { name: "L2", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "L3", exact: true }).click();
  await expect(page.getByText("Demo 301", { exact: true })).toBeVisible();
  await page.screenshot({ path: "/tmp/sfu-indoor.png" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator(".app")).toHaveClass(/dark/);
  expect(errors).toEqual([]);
});
test("search is keyboard accessible and swaps locations", async ({ page }) => {
  await page.goto("/");
  const start = page.getByRole("combobox", { name: "STARTING POINT" });
  await start.focus();
  await start.fill("aq301");
  await expect(
    page.getByText("No matching locations. Try “AQ”."),
  ).toBeVisible();
  await start.fill("301");
  await start.press("Enter");
  await expect(start).toHaveValue("AQ · Demo classroom 301");
  await page
    .getByRole("button", { name: "Swap starting point and destination" })
    .click();
  await expect(start).toHaveValue("ASB · Demo classroom 101");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Indoor location may be approximate",
  );
});
test("mobile planner collapses and 2D buildings remain selectable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Hide planner" }).click();
  await expect(page.locator("aside")).not.toBeVisible();
  await page.getByRole("button", { name: "2D map", exact: true }).click();
  await page
    .getByRole("button", { name: "Explore Academic Quadrangle", exact: true })
    .click();
  await page.getByRole("button", { name: "L2", exact: true }).click();
  await page.screenshot({ path: "/tmp/sfu-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Plan a route" }).click();
  await expect(
    page.getByRole("button", { name: "Find my route" }),
  ).toBeVisible();
});
test("automatically falls back when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return (original as Function).apply(this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: "2D demonstration campus map" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Find my route" }).click();
  await expect(page.getByText("YOUR ROUTE IS READY")).toBeVisible();
});
