import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const portal = process.env.R20_PORTAL_URL;
const civilization = process.env.R20_CIVILIZATION_URL;
const password = process.env.R20_TEST_LOGIN_PASSWORD;
assert.ok(portal && civilization && password, 'R20 UI environment missing');

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ ignoreHTTPSErrors: false });
  const page = await context.newPage();
  await page.goto(new URL('/lifeos', portal).href);
  await page.waitForURL(url => url.origin === new URL(civilization).origin && url.pathname === '/login', { timeout: 45000 });
  assert.equal(new URL(page.url()).searchParams.get('requested_os_code'), 'persona');
  await page.getByLabel('Login ID').fill('test');
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"], form button').first().click();
  await page.waitForURL(url => url.origin === new URL(portal).origin && url.pathname === '/lifeos', { timeout: 45000 });
  await page.locator('[aria-label="LifeOS menu"]').waitFor({ state: 'visible' });
  const cookies = await context.cookies(portal);
  assert.ok(cookies.some(c => c.name === 'portal_persona_server_session_v1' && c.httpOnly && c.secure), 'Missing secure HttpOnly session');
  assert.ok(!cookies.some(c => c.name === 'persona_auth_pkce_v1' && c.value), 'PKCE cookie not cleared');
  await page.reload();
  await page.locator('[aria-label="LifeOS menu"]').waitFor({ state: 'visible' });
  console.log('R20_B5_LIVE_UI=PASS');
} finally {
  await browser.close();
}
