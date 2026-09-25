import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { test, after } from "node:test";
import assert from "node:assert/strict";

const port = 39000 + Math.floor(Math.random() * 10000);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  cwd: process.cwd(),
});
let errors = "";
server.stderr.on("data", (chunk) => { errors += chunk.toString(); });
after(() => { server.kill("SIGTERM"); });

async function page(path) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`UI server exited: ${errors}`);
    try { return await fetch(`${base}${path}`); } catch { await delay(250); }
  }
  throw new Error(`UI server did not start: ${errors}`);
}

test("Japanese menu shows all five navigable destinations in design order", async () => {
  const response = await page("/?lang=ja");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /aria-label="StaticArtOS メインメニュー"/);
  const destinations = ["marketplace", "virtual_exhibitions", "my_library", "works_management", "review_management"];
  let last = -1;
  for (const destination of destinations) {
    const match = html.indexOf(`href="/${destination}?lang=ja"`);
    assert.ok(match > last, `Missing or out-of-order link: ${destination}`);
    last = match;
  }
  assert.match(html, /href="#content"/);
});

test("each route renders the selected state, availability, and return action", async () => {
  for (const destination of ["marketplace", "virtual_exhibitions", "my_library", "works_management", "review_management"]) {
    const response = await page(`/${destination}?lang=ja`);
    assert.equal(response.status, 200, destination);
    const html = await response.text();
    assert.match(html, new RegExp(`<a(?=[^>]*href="/${destination}\\?lang=ja")(?=[^>]*aria-current="page")[^>]*>`), destination);
    assert.match(html, /現在利用できません/);
    assert.match(html, /href="\/\?lang=ja"[^>]*>メニューに戻る/);
  }
});

test("exhibition boundary and English menu are visible in the actual UI", async () => {
  const response = await page("/virtual_exhibitions?lang=en");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Virtual Exhibitions/);
  assert.match(html, /CivilizationOS owns exhibition creation/);
  assert.match(html, /authenticated handoff/);
  assert.match(html, /href="\/marketplace\?lang=en"/);
  const notFound = await page("/invalid_section");
  assert.equal(notFound.status, 404);
});
