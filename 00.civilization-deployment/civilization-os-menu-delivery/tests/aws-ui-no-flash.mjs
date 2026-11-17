/**
 * Real AWS UI acceptance, unauthenticated Android-sized Chromium session.
 * Run only against the deployed AWS CloudFront origin, after deployment.
 * CIV_PORTAL_AWS_UI_ORIGIN=https://... node tests/aws-ui-no-flash.mjs
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const portalRequire = createRequire(path.join(root,
  '08.civilization-portal-site/civilization-portal-site-web/package.json'));
const { chromium } = portalRequire('playwright');
const origin = process.env.CIV_PORTAL_AWS_UI_ORIGIN;
if (!origin || !/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(origin)) {
  throw Error('AWS_UI_ORIGIN_REQUIRED');
}
const routes = ['/business-menu', '/game-menu', '/streaming-menu', '/staticart-menu'];
const browser = await chromium.launch({headless: true});
let failures = 0;
try {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true,
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
    const renderedMenus = [];
    page.on('console', msg => {
      if (msg.text().startsWith('UNAUTH_MENU_RENDERED:'))
        renderedMenus.push(msg.text());
    });
    await page.addInitScript(() => {
      const inspect = () => {
        if (/^\/(business|game|streaming|staticart)-menu(?:\/|$)/.test(location.pathname) &&
            document.querySelector('.shell .hero, .civ-menu-blue-map, #os-title')) {
          console.log('UNAUTH_MENU_RENDERED:' + location.pathname);
        }
      };
      new MutationObserver(inspect).observe(document,
        {childList: true, subtree: true});
    });
    try {
      await page.goto(origin.replace(/\/$/, '') + route,
        {waitUntil: 'domcontentloaded', timeout: 30000});
      await page.waitForURL(url => url.pathname === '/login', {timeout: 30000});
      assert.equal(renderedMenus.length, 0, route + ': menu flash detected');
      console.log('AWS_UI_NO_FLASH_' + route.substring(1).toUpperCase() + '=PASS');
    } catch (error) {
      console.error('AWS_UI_NO_FLASH_' + route.substring(1).toUpperCase() + '=FAIL');
      console.error(String(error.message).slice(0, 250));
      failures++;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
