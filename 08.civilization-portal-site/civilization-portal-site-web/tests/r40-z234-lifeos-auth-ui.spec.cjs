const { test, expect } = require('@playwright/test');
test('anonymous LifeOS entry is denied', async ({ page }) => {
  await page.goto('/lifeos');
  await expect(page.getByTestId('lifeos-auth-required')).toBeVisible();
  await expect(page.getByTestId('lifeos-authenticated')).toHaveCount(0);
});
test('URL identity does not authorize LifeOS', async ({ page }) => {
  await page.goto('/lifeos?civilizationId=forged&owner=forged&sessionRef=forged');
  await expect(page.getByTestId('lifeos-auth-required')).toBeVisible();
});
test('forged cookie does not authorize LifeOS', async ({ page, context }) => {
  await context.addCookies([{ name: 'lifeos_portal_session_v1', value: 'Zm9yZ2Vk.Zm9yZ2Vk', url: 'http://127.0.0.1:31987' }]);
  await page.goto('/lifeos');
  await expect(page.getByTestId('lifeos-auth-required')).toBeVisible();
});
test('start fails closed when CivilizationOS origin is missing', async ({ request }) => {
  const response = await request.get('/api/lifeos/auth/start', { maxRedirects: 0 });
  expect(response.status()).toBe(503);
});

// Exercise the rendered UI and verify the browser is sent to the server-owned start endpoint.
test('anonymous sign-in link routes through the LifeOS auth start', async ({ page }) => {
  await page.goto('/lifeos');
  await expect(page.getByRole('link', { name: /ログイン画面へ|Go to sign-in/ })).toHaveAttribute('href', '/api/lifeos/auth/start');
});
test('logout rejects a request without same-origin proof', async ({ request }) => {
  const response = await request.post('/api/lifeos/auth/logout', { maxRedirects: 0 });
  expect(response.status()).toBe(403);
});
test('callback rejects missing state and code', async ({ request }) => {
  const response = await request.get('/api/lifeos/auth/callback', { maxRedirects: 0 });
  expect(response.status()).toBe(400);
});
