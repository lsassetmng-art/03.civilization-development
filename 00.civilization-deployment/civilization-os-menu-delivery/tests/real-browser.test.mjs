import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer as createDelivery } from "../server.mjs";
import {
  createGatewayServer,
  normalizeConfig
} from "../../civilization-web-gateway/server.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../"
);

const portalRequire = createRequire(
  path.join(
    root,
    "08.civilization-portal-site",
    "civilization-portal-site-web",
    "package.json"
  )
);

const { chromium } = portalRequire("playwright");

const specs = [
  ["business", "/business-menu", "03.business-os"],
  ["game", "/game-menu", "05.game-os"],
  ["streaming", "/streaming-menu", "06.streaming-os"],
  ["staticart", "/staticart-menu", "10.staticart-os"]
];

const servers = [];
let browser;
let checks = 0;

function check(condition, name) {
  assert.ok(condition, name);
  checks++;
}

async function listen(server) {
  servers.push(server);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return `http://127.0.0.1:${server.address().port}`;
}

function portalServer() {
  return http.createServer((_req, res) => {
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "x-upstream-owner": "portal"
    });
    res.end(
      '<!doctype html><html><body>' +
      '<h1 id="portal-title">Portal fixture</h1>' +
      '</body></html>'
    );
  });
}

function config(portalOrigin, deliveryOrigin, enabled) {
  return normalizeConfig({
    host: "127.0.0.1",
    port: 18080,
    portalOrigin,
    personaOrigin: portalOrigin,
    personaRouteTarget: "portal",
    osRoutes: Object.fromEntries(
      specs.map(([owner]) => [
        owner,
        {
          target: enabled ? "os" : "portal",
          origin: deliveryOrigin
        }
      ])
    )
  });
}

try {
  const portalOrigin = await listen(portalServer());
  const deliveryOrigin = await listen(createDelivery());

  const gatewayOrigin = await listen(
    createGatewayServer(
      config(portalOrigin, deliveryOrigin, true)
    )
  );

  browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });

  for (const [owner, route, directory] of specs) {
    const contract = JSON.parse(
      fs.readFileSync(
        path.join(root, directory, "os-menu/menu-contract.json"),
        "utf8"
      )
    );

    const page = await context.newPage();
    const errors = [];
    const failedResources = [];

    page.on("pageerror", error => {
      errors.push(error.message);
    });

    page.on("response", response => {
      if (
        response.status() >= 400 &&
        new URL(response.url()).origin === gatewayOrigin
      ) {
        failedResources.push(
          `${response.status()} ${response.url()}`
        );
      }
    });

    try {
      const response = await page.goto(
        gatewayOrigin + route + "/",
        {
          waitUntil: "networkidle",
          timeout: 30000
        }
      );

      check(response?.status() === 200, `${owner}:http`);
      check(
        new URL(page.url()).pathname === route + "/",
        `${owner}:path`
      );

      check(
        await page.locator("#os-title").textContent()
          === contract.displayName,
        `${owner}:title`
      );

      check(
        await page.locator(".tile").count()
          === contract.menuEntries.length,
        `${owner}:entries`
      );

      check(
        await page.locator(
          ".tile[aria-disabled='true']"
        ).count() === contract.menuEntries.length,
        `${owner}:disabled`
      );

      check(
        await page.locator(".tile a, .tile button").count() === 0,
        `${owner}:no-unavailable-actions`
      );

      check(
        await page.locator(".portal-link").getAttribute("href")
          === "/",
        `${owner}:portal-link`
      );

      check(
        await page.evaluate(() =>
          document.documentElement.scrollWidth
          <= window.innerWidth + 1
        ),
        `${owner}:mobile-width`
      );

      check(errors.length === 0, `${owner}:javascript`);
      check(
        failedResources.length === 0,
        `${owner}:resource-loading`
      );

      for (const entry of contract.menuEntries) {
        check(
          await page.getByRole("heading", {
            name: entry.label,
            exact: true
          }).count() === 1,
          `${owner}:entry:${entry.id}`
        );
      }

      await page.locator(".portal-link").click();
      await page.waitForURL(gatewayOrigin + "/");

      check(
        await page.locator("#portal-title").textContent()
          === "Portal fixture",
        `${owner}:portal-return`
      );

      console.log(`M5_UI_${owner.toUpperCase()}=PASS`);
    } finally {
      await page.close();
    }

    const lookalike = await fetch(
      gatewayOrigin + route + "-lookalike"
    );

    check(
      lookalike.headers.get("x-upstream-owner") === "portal",
      `${owner}:prefix-isolation`
    );
  }

  const rollbackOrigin = await listen(
    createGatewayServer(
      config(portalOrigin, deliveryOrigin, false)
    )
  );

  for (const [owner, route] of specs) {
    const response = await fetch(rollbackOrigin + route);
    check(
      response.headers.get("x-upstream-owner") === "portal",
      `${owner}:rollback`
    );
  }

  for (const route of [
    "/lifeos",
    "/persona-menu",
    "/aiworker-menu"
  ]) {
    const response = await fetch(gatewayOrigin + route);
    check(
      response.headers.get("x-upstream-owner") === "portal",
      `${route}:untouched`
    );
  }

  await context.close();

  console.log(`CHECKS_PASS=${checks}`);
  console.log("CHECKS_FAIL=0");
  console.log("RESULT=M5_REAL_DELIVERY_BROWSER_PASS");
  console.log("PRODUCTION_CHANGE=NO");
} catch (error) {
  console.error("RESULT=M5_REAL_DELIVERY_BROWSER_FAIL");
  console.error(`ERROR=${error.stack || error.message}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();

  for (const server of servers.reverse()) {
    await new Promise(resolve => {
      if (!server.listening) return resolve();
      server.close(() => resolve());
    });
  }
}
