import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig, selectUpstream } from "../server.mjs";

const definitions = [
  ["business", "/business-menu"],
  ["life", "/lifeos"],
  ["streaming", "/streaming-menu"],
  ["staticart", "/staticart-menu"],
  ["game", "/game-menu"],
  ["aiworker", "/aiworker-menu"]
];

function config(osRoutes = {}) {
  return normalizeConfig({
    host: "127.0.0.1",
    port: 18080,
    portalOrigin: "http://127.0.0.1:18081",
    personaOrigin: "http://127.0.0.1:18082",
    personaRouteTarget: "persona",
    osRoutes
  });
}

test("all six OS routes default to Portal", () => {
  const c = config();

  for (const [, root] of definitions) {
    assert.equal(selectUpstream(c, root).owner, "portal");
  }

  assert.equal(selectUpstream(c, "/persona-menu").owner, "persona");
});

for (const [owner, root] of definitions) {
  test(`${owner}: ownership, prefix safety and rollback`, () => {
    const c = config({
      [owner]: {
        target: "os",
        origin: "http://127.0.0.1:19000"
      }
    });

    for (const path of [root, root + "/", root + "/child?x=1"]) {
      const selected = selectUpstream(c, path);
      assert.equal(selected.owner, owner);
      assert.equal(selected.origin.origin, "http://127.0.0.1:19000");
    }

    assert.equal(selectUpstream(c, root + "-other").owner, "portal");
    assert.equal(selectUpstream(c, "/persona-menu").owner, "persona");

    const rolledBack = config({ [owner]: { target: "portal" } });
    assert.equal(selectUpstream(rolledBack, root).owner, "portal");
  });

  test(`${owner}: invalid configuration fails closed`, () => {
    assert.throws(
      () => config({ [owner]: { target: "os" } }),
      /WEB_UPSTREAM_ORIGIN/
    );

    assert.throws(
      () => config({ [owner]: { target: "invalid" } }),
      /ROUTE_TARGET/
    );

    assert.throws(
      () => config({
        [owner]: {
          target: "os",
          origin: "https://example.com/invalid-path"
        }
      }),
      /origin without a path/
    );
  });
}

test("ordinary Portal paths remain Portal-owned", () => {
  const c = config(
    Object.fromEntries(
      definitions.map(([owner]) => [
        owner,
        { target: "os", origin: "http://127.0.0.1:19000" }
      ])
    )
  );

  for (const path of ["/", "/settings", "/api/persona/auth/start"]) {
    assert.equal(selectUpstream(c, path).owner, "portal");
  }
});
