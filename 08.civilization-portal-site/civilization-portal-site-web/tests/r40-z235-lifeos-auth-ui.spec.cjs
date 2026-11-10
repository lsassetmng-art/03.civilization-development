"use strict";

const { test, expect } = require("@playwright/test");
const { createHmac } = require("node:crypto");
const { createServer } = require("node:http");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");

const HOST = "127.0.0.1";
const ID = "r235-test-identity";
const SID = Buffer.alloc(32, 17).toString("base64url");
const SECRET = "r235-portal-session-secret-for-local-ui-testing-only";
const EXCHANGE_SECRET = "r235-exchange-secret-for-local-ui-testing-only";

let mock;
let next;
let baseUrl;
let civilizationUrl;
let statusMode = "valid";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

async function waitForPortal(url, child) {
  for (let i = 0; i < 90; i++) {
    if (child.exitCode !== null) {
      throw new Error("Next.js exited before UI readiness");
    }
    try {
      const response = await fetch(url + "/lifeos", {
        signal: AbortSignal.timeout(1500)
      });
      if (response.status < 500) return;
    } catch {}
    await delay(1000);
  }
  throw new Error("Next.js UI readiness timeout");
}

function sessionCookie() {
  const payload = Buffer.from(JSON.stringify({
    id: ID,
    sid: SID,
    exp: Date.now() + 3600000
  })).toString("base64url");

  const signature = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  return payload + "." + signature;
}

test.describe("R40-Z235 session revocation UI", () => {
  test.setTimeout(150000);
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    mock = createServer(async (req, res) => {
      res.setHeader("cache-control", "no-store");
      res.setHeader("content-type", "application/json");

      if (
        req.url !== "/api/civilization/auth/lifeos/status" ||
        req.method !== "POST" ||
        req.headers.authorization !== "Bearer " + EXCHANGE_SECRET
      ) {
        res.writeHead(404);
        res.end(JSON.stringify({ ok: false }));
        return;
      }

      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 4096) break;
      }

      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false }));
        return;
      }

      if (parsed.civilizationId !== ID || parsed.sid !== SID) {
        res.writeHead(401);
        res.end(JSON.stringify({ ok: false }));
        return;
      }

      if (statusMode === "unavailable") {
        res.writeHead(503);
        res.end(JSON.stringify({ ok: false }));
        return;
      }

      if (statusMode === "revoked") {
        res.writeHead(401);
        res.end(JSON.stringify({ ok: false }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, valid: true }));
    });

    const mockPort = await listen(mock);
    civilizationUrl = "http://" + HOST + ":" + mockPort;

    const nextBin = require.resolve("next/dist/bin/next", {
      paths: [process.cwd()]
    });

    const reserve = createServer();
    const portalPort = await listen(reserve);
    await new Promise(resolve => reserve.close(resolve));

    baseUrl = "http://" + HOST + ":" + portalPort;

    next = spawn(process.execPath, [
      nextBin, "dev", "--webpack",
      "--hostname", HOST,
      "--port", String(portalPort)
    ], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "development",
        LIFEOS_PORTAL_SESSION_SECRET: SECRET,
        LIFEOS_HANDOFF_EXCHANGE_SECRET: EXCHANGE_SECRET,
        LIFEOS_CIVILIZATION_ORIGIN: civilizationUrl
      },
      stdio: "ignore"
    });

    await waitForPortal(baseUrl, next);
  });

  test.afterAll(async () => {
    if (next && next.exitCode === null) {
      next.kill("SIGTERM");
    }
    if (mock) {
      await new Promise(resolve => mock.close(resolve));
    }
  });

  test.beforeEach(async ({ context }) => {
    statusMode = "valid";
    await context.clearCookies();
    await context.addCookies([{
      name: "lifeos_portal_session_v1",
      value: sessionCookie(),
      url: baseUrl,
      httpOnly: true,
      sameSite: "Lax"
    }]);
  });

  test("valid session becomes unauthorized after revocation", async ({ page }) => {
    await page.goto(baseUrl + "/lifeos");
    await expect(page.getByTestId("lifeos-authenticated")).toBeVisible();
    await expect(page.getByRole("button", { name: "ログアウト" })).toBeVisible();

    statusMode = "revoked";

    await page.reload();
    await expect(page.getByTestId("lifeos-auth-required")).toBeVisible();
    await expect(page.getByTestId("lifeos-authenticated")).toHaveCount(0);
    await expect(page.getByRole("link", {
      name: /ログイン画面へ|Go to sign-in/
    })).toBeVisible();
  });

  test("status service outage fails closed in rendered UI", async ({ page }) => {
    statusMode = "unavailable";

    await page.goto(baseUrl + "/lifeos");
    await expect(page.getByTestId("lifeos-auth-required")).toBeVisible();
    await expect(page.getByTestId("lifeos-authenticated")).toHaveCount(0);
  });

  test("forged cookie never reaches authenticated UI", async ({ page, context }) => {
    await context.clearCookies();
    await context.addCookies([{
      name: "lifeos_portal_session_v1",
      value: "Zm9yZ2Vk.Zm9yZ2Vk",
      url: baseUrl
    }]);

    await page.goto(baseUrl + "/lifeos");
    await expect(page.getByTestId("lifeos-auth-required")).toBeVisible();
  });
});
