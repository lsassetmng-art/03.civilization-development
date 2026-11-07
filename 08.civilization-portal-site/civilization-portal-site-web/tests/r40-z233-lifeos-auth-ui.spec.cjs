const { test, expect } = require("@playwright/test");

const cases = [
  {
    name: "no authentication",
    path: "/lifeos"
  },
  {
    name: "forged identity",
    path: "/lifeos?civilizationId=forged&owner=forged"
  },
  {
    name: "forged session reference",
    path: "/lifeos?civilizationId=forged&owner=forged&sessionRef=forged"
  },
  {
    name: "forged future expiration",
    path: "/lifeos?civilizationId=forged&owner=forged&expiresAt=9999999999999"
  },
  {
    name: "expired identity",
    path: "/lifeos?civilizationId=forged&owner=forged&expiresAt=1"
  },
  {
    name: "forged section navigation",
    path: "/lifeos?section=dashboard&civilizationId=forged&owner=forged"
  },
  {
    name: "forged quick action",
    path: "/lifeos?action=daily_checkin&civilizationId=forged&owner=forged"
  }
];

for (const item of cases) {
  test(`LifeOS denies ${item.name}`, async ({ page }) => {
    const response = await page.goto(item.path, {
      waitUntil: "domcontentloaded"
    });

    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(500);

    await expect(
      page.locator(
        'a[href*="/lifeos?section="], a[href*="/lifeos?action="]'
      )
    ).toHaveCount(0);

    await expect(
      page.locator('a[href*="app-web/index.html"]')
    ).toHaveCount(0);

    await expect(
      page.getByTestId("lifeos-auth-required")
    ).toBeVisible();
  });
}
