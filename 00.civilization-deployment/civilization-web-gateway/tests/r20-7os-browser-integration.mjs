import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createGatewayServer } from "../server.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../"
);

const specs = [
  ["business", "03.business-os", "/business-menu"],
  ["life", "04.life-os", "/lifeos"],
  ["game", "05.game-os", "/game-menu"],
  ["streaming", "06.streaming-os", "/streaming-menu"],
  ["staticart", "10.staticart-os", "/staticart-menu"]
];

const portalRequire = createRequire(
  path.join(
    root,
    "08.civilization-portal-site",
    "civilization-portal-site-web",
    "package.json"
  )
);

const { chromium } = portalRequire("playwright");

const servers = [];
let browser;
let checks = 0;

function verify(value, label) {
  assert.ok(value, label);
  checks++;
}

async function listen(server) {
  servers.push(server);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  return `http://127.0.0.1:${server.address().port}`;
}

function stop(server) {
  return new Promise(resolve => {
    if (!server.listening) return resolve();
    server.close(() => resolve());
  });
}

function fixture(owner) {
  return http.createServer((req, res) => {
    res.setHeader("x-upstream-owner", owner);
    res.end(`${owner}:${req.url}`);
  });
}

function staticOsServer(directory, prefix) {
  const base = path.resolve(directory);

  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === prefix) {
      res.writeHead(308, {
        location: prefix + "/" + url.search
      });
      res.end();
      return;
    }

    if (!url.pathname.startsWith(prefix + "/")) {
      res.writeHead(404);
      res.end();
      return;
    }

    let relative;

    try {
      relative = decodeURIComponent(
        url.pathname.slice(prefix.length + 1)
      );
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }

    if (!relative) relative = "index.html";

    const filename = path.resolve(base, relative);

    if (
      !filename.startsWith(base + path.sep) ||
      !fs.existsSync(filename) ||
      !fs.statSync(filename).isFile()
    ) {
      res.writeHead(404);
      res.end();
      return;
    }

    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    };

    res.writeHead(200, {
      "content-type":
        contentTypes[path.extname(filename)] ||
        "application/octet-stream",
      "cache-control": "no-store",
      "x-upstream-owner": path.basename(path.dirname(base))
    });

    fs.createReadStream(filename).pipe(res);
  });
}

try {
  const portalOrigin = await listen(fixture("portal"));
  const personaOrigin = await listen(fixture("persona"));
  const aiworkerOrigin = await listen(fixture("aiworker"));

  const osRoutes = {
    aiworker: {
      target: "os",
      origin: aiworkerOrigin
    }
  };

  const contracts = new Map();

  for (const [id, directory, route] of specs) {
    const osRoot = path.join(root, directory, "os-menu");
    const contract = JSON.parse(
      fs.readFileSync(
        path.join(osRoot, "menu-contract.json"),
        "utf8"
      )
    );

    verify(contract.owner === id, `${id}:owner`);
    verify(contract.publicRoute === route, `${id}:route`);
    verify(
      contract.deployment.gatewayRouteEnabled === false,
      `${id}:deployment-off`
    );

    contracts.set(id, contract);

    osRoutes[id] = {
      target: "os",
      origin: await listen(staticOsServer(osRoot, route))
    };
  }

  const gateway = createGatewayServer({
    host: "127.0.0.1",
    port: 18080,
    portalOrigin,
    personaOrigin,
    personaRouteTarget: "persona",
    osRoutes
  });

  const origin = await listen(gateway);

  const portalResponse = await fetch(origin + "/settings");
  verify(
    portalResponse.headers.get("x-upstream-owner") === "portal",
    "portal:ordinary-route"
  );

  const personaResponse = await fetch(
    origin + "/persona-menu"
  );
  verify(
    personaResponse.headers.get("x-upstream-owner") === "persona",
    "persona:route"
  );

  const aiworkerResponse = await fetch(
    origin + "/aiworker-menu"
  );
  verify(
    aiworkerResponse.headers.get("x-upstream-owner") === "aiworker",
    "aiworker:route"
  );

  for (const [id, , route] of specs) {
    const response = await fetch(
      origin + route + "-lookalike"
    );

    verify(
      response.headers.get("x-upstream-owner") === "portal",
      `${id}:prefix-isolation`
    );
  }

  browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });

  for (const [id, , route] of specs) {
    const contract = contracts.get(id);
    const page = await context.newPage();
    const errors = [];

    page.on("pageerror", error => {
      errors.push(error.message);
    });

    try {
      const response = await page.goto(
        origin + route,
        {
          waitUntil: "networkidle",
          timeout: 30000
        }
      );

      verify(response?.status() === 200, `${id}:http`);

      verify(
        new URL(page.url()).pathname === route + "/",
        `${id}:canonical-path`
      );

      verify(
        await page.locator("#os-title").textContent()
          === contract.displayName,
        `${id}:title`
      );

      verify(
        await page.locator(".tile").count()
          === contract.menuEntries.length,
        `${id}:tile-count`
      );

      verify(
        await page.locator(
          ".tile[aria-disabled='true']"
        ).count() === contract.menuEntries.length,
        `${id}:disabled`
      );

      verify(
        await page.locator(
          ".tile a, .tile button"
        ).count() === 0,
        `${id}:no-action`
      );

      verify(
        await page.locator(
          ".portal-link"
        ).getAttribute("href") === "/",
        `${id}:portal-link`
      );

      verify(
        await page.evaluate(() =>
          document.documentElement.scrollWidth
          <= window.innerWidth + 1
        ),
        `${id}:mobile-width`
      );

      verify(errors.length === 0, `${id}:javascript`);

      for (const entry of contract.menuEntries) {
        verify(
          await page.getByRole(
            "heading",
            { name: entry.label, exact: true }
          ).count() === 1,
          `${id}:entry:${entry.id}`
        );
      }

      console.log(`UI_${id.toUpperCase()}=PASS`);
    } finally {
      await page.close();
    }
  }

  await context.close();

  const rollbackGateway = createGatewayServer({
    host: "127.0.0.1",
    port: 18080,
    portalOrigin,
    personaOrigin,
    personaRouteTarget: "persona",
    osRoutes: Object.fromEntries(
      Object.entries(osRoutes).map(([id, value]) => [
        id,
        { ...value, target: "portal" }
      ])
    )
  });

  const rollbackOrigin = await listen(rollbackGateway);

  for (const [id, , route] of specs) {
    const response = await fetch(
      rollbackOrigin + route
    );

    verify(
      response.headers.get("x-upstream-owner") === "portal",
      `${id}:rollback`
    );
  }

  const aiworkerRollback = await fetch(
    rollbackOrigin + "/aiworker-menu"
  );

  verify(
    aiworkerRollback.headers.get("x-upstream-owner")
      === "portal",
    "aiworker:rollback"
  );

  console.log(`CHECKS_PASS=${checks}`);
  console.log("CHECKS_FAIL=0");
  console.log("RESULT=M2C_BROWSER_INTEGRATION_PASS");
  console.log("PRODUCTION_DEPLOYMENT_VERIFIED=NO");
} catch (error) {
  console.error("RESULT=M2C_BROWSER_INTEGRATION_FAILED");
  console.error(`ERROR=${error.message}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();

  for (const server of servers.reverse()) {
    await stop(server);
  }
}
