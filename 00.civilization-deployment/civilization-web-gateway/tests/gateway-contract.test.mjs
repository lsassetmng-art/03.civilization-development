import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import {
  createGatewayServer,
  isPersonaPath,
  normalizeConfig
} from "../server.mjs";

async function listenLoopback(server) {
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);

    server.listen(0, "127.0.0.1");
  });

  const address = server.address();

  assert.ok(address);
  assert.notEqual(typeof address, "string");
  assert.equal(address.address, "127.0.0.1");

  return address.port;
}

async function closeServer(server) {
  if (!server.listening) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function createRecordingUpstream(owner) {
  const requests = [];

  const server = http.createServer(async (req, res) => {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString("utf8");

    requests.push({
      method: req.method,
      url: req.url,
      headers: { ...req.headers },
      body
    });

    if (req.url?.startsWith("/persona-menu/status-201")) {
      res.writeHead(201, {
        "content-type": "text/plain; charset=utf-8",
        "x-upstream-owner": owner
      });

      res.end(`${owner}:created`);
      return;
    }

    res.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "x-upstream-owner": owner
    });

    res.end(`${owner}:${req.method}:${req.url}:${body}`);
  });

  return {
    owner,
    server,
    requests
  };
}

async function request(origin, path, options = {}) {
  const url = new URL(path, origin);
  const method = options.method ?? "GET";
  const body =
    options.body === undefined
      ? null
      : Buffer.from(String(options.body));

  const headers = {
    ...(options.headers ?? {})
  };

  if (
    body &&
    headers["content-length"] === undefined &&
    headers["Content-Length"] === undefined
  ) {
    headers["content-length"] = String(body.length);
  }

  return await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        method,
        path: `${url.pathname}${url.search}`,
        headers
      },
      async (res) => {
        try {
          const chunks = [];

          for await (const chunk of res) {
            chunks.push(chunk);
          }

          resolve({
            status: res.statusCode,
            headers: { ...res.headers },
            body: Buffer.concat(chunks).toString("utf8")
          });
        } catch (error) {
          reject(error);
        }
      }
    );

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function configFor({
  portalOrigin,
  personaOrigin,
  target
}) {
  return {
    host: "127.0.0.1",
    port: 18080,
    portalOrigin,
    personaOrigin,
    personaRouteTarget: target
  };
}

async function startTopology(target) {
  const portal = createRecordingUpstream("portal");
  const persona = createRecordingUpstream("persona");

  const portalPort = await listenLoopback(portal.server);
  const personaPort = await listenLoopback(persona.server);

  const portalOrigin = `http://127.0.0.1:${portalPort}`;
  const personaOrigin = `http://127.0.0.1:${personaPort}`;

  const gateway = createGatewayServer(
    configFor({
      portalOrigin,
      personaOrigin,
      target
    })
  );

  const gatewayPort = await listenLoopback(gateway);

  return {
    portal,
    persona,
    gateway,
    gatewayOrigin: `http://127.0.0.1:${gatewayPort}`,
    portalOrigin,
    personaOrigin
  };
}

async function stopTopology(topology) {
  await closeServer(topology.gateway);
  await closeServer(topology.persona.server);
  await closeServer(topology.portal.server);
}

test(
  "Persona path predicate is exact and prefix-safe",
  { concurrency: false },
  () => {
    assert.equal(isPersonaPath("/persona-menu"), true);
    assert.equal(isPersonaPath("/persona-menu/"), true);

    assert.equal(
      isPersonaPath("/persona-menu/persona-create"),
      true
    );

    assert.equal(
      isPersonaPath("/persona-menu/_next/chunk.js"),
      true
    );

    assert.equal(
      isPersonaPath("/persona-menu-other"),
      false
    );

    assert.equal(
      isPersonaPath("/persona-menu2"),
      false
    );

    assert.equal(
      isPersonaPath("/personas-menu"),
      false
    );
  }
);

test(
  "target=persona routes all governed Persona paths to PersonaOS",
  { concurrency: false },
  async () => {
    const topology = await startTopology("persona");

    try {
      const paths = [
        "/persona-menu",
        "/persona-menu/persona-create",
        "/persona-menu/persona-create/image-upload",
        "/persona-menu/persona-create/ai-generate",
        "/persona-menu/persona-create/parts-select",
        "/persona-menu/persona-create/drafts",
        "/persona-menu/_next/static/test.js"
      ];

      for (const path of paths) {
        const result = await request(
          topology.gatewayOrigin,
          path
        );

        assert.equal(result.status, 200);

        assert.equal(
          result.headers["x-upstream-owner"],
          "persona"
        );
      }

      assert.equal(
        topology.persona.requests.length,
        paths.length
      );

      assert.equal(
        topology.portal.requests.length,
        0
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "lookalike and ordinary Portal paths remain Portal-owned",
  { concurrency: false },
  async () => {
    const topology = await startTopology("persona");

    try {
      const lookalike = await request(
        topology.gatewayOrigin,
        "/persona-menu-other"
      );

      const ordinary = await request(
        topology.gatewayOrigin,
        "/settings"
      );

      assert.equal(
        lookalike.headers["x-upstream-owner"],
        "portal"
      );

      assert.equal(
        ordinary.headers["x-upstream-owner"],
        "portal"
      );

      assert.equal(
        topology.portal.requests.length,
        2
      );

      assert.equal(
        topology.persona.requests.length,
        0
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "target=portal keeps Persona namespace on Portal",
  { concurrency: false },
  async () => {
    const topology = await startTopology("portal");

    try {
      const result = await request(
        topology.gatewayOrigin,
        "/persona-menu/persona-create/drafts"
      );

      assert.equal(result.status, 200);

      assert.equal(
        result.headers["x-upstream-owner"],
        "portal"
      );

      assert.equal(
        topology.portal.requests.length,
        1
      );

      assert.equal(
        topology.persona.requests.length,
        0
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "raw path query method body cookie and authorization are preserved",
  { concurrency: false },
  async () => {
    const topology = await startTopology("persona");

    try {
      const result = await request(
        topology.gatewayOrigin,
        "/persona-menu/persona-create/drafts?resumeDraft=1&language_code=ja-jp",
        {
          method: "POST",
          body: "gateway-body",
          headers: {
            cookie: "session=test-session; locale=ja-jp",
            authorization: "Bearer test-token",
            "content-type": "text/plain"
          }
        }
      );

      assert.equal(result.status, 200);

      assert.equal(
        topology.persona.requests.length,
        1
      );

      const received = topology.persona.requests[0];

      assert.equal(received.method, "POST");

      assert.equal(
        received.url,
        "/persona-menu/persona-create/drafts?resumeDraft=1&language_code=ja-jp"
      );

      assert.equal(
        received.headers.cookie,
        "session=test-session; locale=ja-jp"
      );

      assert.equal(
        received.headers.authorization,
        "Bearer test-token"
      );

      assert.equal(
        received.headers["content-type"],
        "text/plain"
      );

      assert.equal(
        received.body,
        "gateway-body"
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "upstream status headers and body are preserved",
  { concurrency: false },
  async () => {
    const topology = await startTopology("persona");

    try {
      const result = await request(
        topology.gatewayOrigin,
        "/persona-menu/status-201"
      );

      assert.equal(result.status, 201);

      assert.equal(
        result.headers["x-upstream-owner"],
        "persona"
      );

      assert.equal(
        result.body,
        "persona:created"
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "connection-listed hop-by-hop request header is not forwarded",
  { concurrency: false },
  async () => {
    const topology = await startTopology("persona");

    try {
      const result = await request(
        topology.gatewayOrigin,
        "/persona-menu",
        {
          headers: {
            connection: "x-hop-test",
            "x-hop-test": "must-not-arrive",
            "x-end-to-end-test": "must-arrive"
          }
        }
      );

      assert.equal(result.status, 200);

      const received = topology.persona.requests[0];

      assert.equal(
        received.headers["x-hop-test"],
        undefined
      );

      assert.equal(
        received.headers["x-end-to-end-test"],
        "must-arrive"
      );
    } finally {
      await stopTopology(topology);
    }
  }
);

test(
  "Persona upstream failure returns 502 without Portal fallback",
  { concurrency: false },
  async () => {
    const portal = createRecordingUpstream("portal");
    const portalPort = await listenLoopback(portal.server);

    const reserve = http.createServer();
    const unavailablePort = await listenLoopback(reserve);

    await closeServer(reserve);

    const gateway = createGatewayServer(
      configFor({
        portalOrigin: `http://127.0.0.1:${portalPort}`,
        personaOrigin: `http://127.0.0.1:${unavailablePort}`,
        target: "persona"
      })
    );

    const gatewayPort = await listenLoopback(gateway);
    const gatewayOrigin =
      `http://127.0.0.1:${gatewayPort}`;

    try {
      const result = await request(
        gatewayOrigin,
        "/persona-menu/persona-create"
      );

      assert.equal(result.status, 502);
      assert.equal(result.body, "Bad Gateway\n");

      assert.equal(
        portal.requests.length,
        0
      );
    } finally {
      await closeServer(gateway);
      await closeServer(portal.server);
    }
  }
);

test(
  "invalid routing target and malformed origins fail closed",
  { concurrency: false },
  () => {
    assert.throws(
      () =>
        normalizeConfig({
          host: "127.0.0.1",
          port: 18080,
          portalOrigin: "http://127.0.0.1:18081",
          personaOrigin: "http://127.0.0.1:18082",
          personaRouteTarget: "automatic"
        }),
      /PERSONAOS_ROUTE_TARGET/
    );

    assert.throws(
      () =>
        normalizeConfig({
          host: "127.0.0.1",
          port: 18080,
          portalOrigin:
            "http://127.0.0.1:18081/not-an-origin",
          personaOrigin: "http://127.0.0.1:18082",
          personaRouteTarget: "persona"
        }),
      /origin without a path/
    );

    assert.throws(
      () =>
        normalizeConfig({
          host: "127.0.0.1",
          port: 18080,
          portalOrigin: "http://127.0.0.1:18081",
          personaOrigin: "ftp://127.0.0.1:18082",
          personaRouteTarget: "persona"
        }),
      /http or https/
    );
  }
);
