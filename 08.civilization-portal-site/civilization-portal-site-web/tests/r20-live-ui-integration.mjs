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
  const navigationEvents = [];
  const record = (kind, value) => {
    navigationEvents.push({ kind, value: String(value).slice(0, 500) });
    if (navigationEvents.length > 40) navigationEvents.shift();
  };

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) record('navigation', frame.url());
  });
  page.on('requestfailed', request => {
    if (request.isNavigationRequest()) {
      record('requestfailed', request.url() + ' ' + (request.failure()?.errorText ?? ''));
    }
  });
  page.on('response', response => {
    if (response.request().isNavigationRequest()) {
      record('response', response.status() + ' ' + response.url());
    }
  });
  page.on('pageerror', error => record('pageerror', error.message));

  try {
    const initialResponse = await page.goto(new URL('/lifeos', portal).href);
    record('initial-response', initialResponse?.status() ?? 'none');
    await page.waitForURL(url => url.origin === new URL(civilization).origin && url.pathname === '/login', { timeout: 45000 });
  } catch (error) {
    console.error('R20_UI_DIAGNOSTIC=' + JSON.stringify({
      finalUrl: page.url(),
      events: navigationEvents,
      error: String(error).slice(0, 700)
    }));
    throw error;
  }
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

  const sections = [
    'dashboard',
    'habits',
    'health',
    'review',
    'settings'
  ];

  const actions = [
    'daily_checkin',
    'log_habit',
    'log_health_metric',
    'create_goal_event'
  ];

  for (const section of sections) {
    await page.goto(new URL('/lifeos', portal).href);
    await page.locator('[aria-label="LifeOS menu"]').waitFor();

    await page.locator(
      '[aria-label="LifeOS menu"] a[href="/lifeos?section=' + section + '"]'
    ).click();

    await page.waitForURL(
      url => url.pathname === '/lifeos' &&
        url.searchParams.get('section') === section
    );

    await page.locator(
      '[data-lifeos-view="section:' + section + '"]'
    ).waitFor({ state: 'visible' });

    await page.reload();

    await page.locator(
      '[data-lifeos-view="section:' + section + '"]'
    ).waitFor({ state: 'visible' });

    await page.getByRole('link', {
      name: /LifeOSトップへ戻る|Back to LifeOS/
    }).click();

    await page.locator('[aria-label="LifeOS menu"]').waitFor();
  }

  for (const action of actions) {
    await page.goto(new URL('/lifeos', portal).href);
    await page.locator('[aria-label="LifeOS menu"]').waitFor();

    await page.locator(
      '.quick-actions a[href="/lifeos?action=' + action + '"]'
    ).click();

    await page.waitForURL(
      url => url.pathname === '/lifeos' &&
        url.searchParams.get('action') === action
    );

    await page.locator(
      '[data-lifeos-view="action:' + action + '"]'
    ).waitFor({ state: 'visible' });

    await page.goBack();
    await page.locator('[aria-label="LifeOS menu"]').waitFor();
  }

  await page.goto(new URL('/lifeos?section=invalid', portal).href);

  await page.getByRole('alert').waitFor({ state: 'visible' });

  await page.goto(new URL('/lifeos?section=health', portal).href);

  await page.locator(
    '[data-lifeos-view="section:health"]'
  ).waitFor({ state: 'visible' });

  console.log('R20_LIFEOS_NAVIGATION_UI=PASS');

  console.log('R20_B5_LIVE_UI=PASS');
} finally {
  await browser.close();
}
