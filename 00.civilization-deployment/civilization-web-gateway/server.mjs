import http from "node:http";
import https from "node:https";
import { pathToFileURL } from "node:url";

const PERSONA_ROOT = "/persona-menu";

const BASE_HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

function requiredText(name, value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}

function normalizePort(value) {
  const text = requiredText(
    "CIVILIZATION_WEB_GATEWAY_PORT",
    String(value ?? "")
  );

  if (!/^[0-9]+$/.test(text)) {
    throw new Error(
      "CIVILIZATION_WEB_GATEWAY_PORT must be an integer"
    );
  }

  const port = Number(text);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      "CIVILIZATION_WEB_GATEWAY_PORT must be between 1 and 65535"
    );
  }

  return port;
}

function normalizeOrigin(name, value) {
  const raw = requiredText(name, String(value ?? ""));
  let url;

  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} must be a valid URL origin`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not contain credentials`);
  }

  if (url.search || url.hash) {
    throw new Error(`${name} must not contain query or fragment`);
  }

  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error(`${name} must be an origin without a path`);
  }

  return new URL(url.origin);
}

function normalizeRouteTarget(value) {
  const target = requiredText("PERSONAOS_ROUTE_TARGET", value);

  if (target !== "portal" && target !== "persona") {
    throw new Error(
      "PERSONAOS_ROUTE_TARGET must be portal or persona"
    );
  }

  return target;
}

export function normalizeConfig(input) {
  if (!input || typeof input !== "object") {
    throw new Error("gateway configuration is required");
  }

  const host = requiredText(
    "CIVILIZATION_WEB_GATEWAY_HOST",
    input.host
  );

  const port = normalizePort(input.port);

  const portalOrigin = normalizeOrigin(
    "CIVILIZATION_PORTAL_UPSTREAM_ORIGIN",
    input.portalOrigin
  );

  const personaOrigin = normalizeOrigin(
    "PERSONAOS_WEB_UPSTREAM_ORIGIN",
    input.personaOrigin
  );

  const personaRouteTarget = normalizeRouteTarget(
    input.personaRouteTarget
  );

  return Object.freeze({
    host,
    port,
    portalOrigin,
    personaOrigin,
    personaRouteTarget
  });
}

export function loadConfig(env = process.env) {
  return normalizeConfig({
    host: env.CIVILIZATION_WEB_GATEWAY_HOST,
    port: env.CIVILIZATION_WEB_GATEWAY_PORT,
    portalOrigin: env.CIVILIZATION_PORTAL_UPSTREAM_ORIGIN,
    personaOrigin: env.PERSONAOS_WEB_UPSTREAM_ORIGIN,
    personaRouteTarget: env.PERSONAOS_ROUTE_TARGET
  });
}

export function isPersonaPath(pathname) {
  return (
    pathname === PERSONA_ROOT ||
    pathname.startsWith(`${PERSONA_ROOT}/`)
  );
}

export function selectUpstream(config, requestUrl) {
  const parsed = new URL(
    requestUrl || "/",
    "http://civilization.gateway.invalid"
  );

  if (
    config.personaRouteTarget === "persona" &&
    isPersonaPath(parsed.pathname)
  ) {
    return Object.freeze({
      owner: "persona",
      origin: config.personaOrigin
    });
  }

  return Object.freeze({
    owner: "portal",
    origin: config.portalOrigin
  });
}

function connectionHeaderTokens(headers) {
  const raw = headers.connection;

  if (!raw) {
    return [];
  }

  const values = Array.isArray(raw) ? raw : [raw];

  return values
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function sanitizeHeaders(headers) {
  const blocked = new Set(BASE_HOP_BY_HOP_HEADERS);

  for (const token of connectionHeaderTokens(headers)) {
    blocked.add(token);
  }

  const result = {};

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    if (blocked.has(name.toLowerCase())) {
      continue;
    }

    result[name] = value;
  }

  return result;
}

function appendForwardedFor(existing, address) {
  if (!address) {
    return existing;
  }

  if (!existing) {
    return address;
  }

  if (Array.isArray(existing)) {
    return `${existing.join(", ")}, ${address}`;
  }

  return `${existing}, ${address}`;
}

function requestHeadersForUpstream(req, origin) {
  const originalHost = req.headers.host;
  const headers = sanitizeHeaders(req.headers);

  headers.host = origin.host;

  if (originalHost && !headers["x-forwarded-host"]) {
    headers["x-forwarded-host"] = originalHost;
  }

  if (!headers["x-forwarded-proto"]) {
    headers["x-forwarded-proto"] =
      req.socket.encrypted === true ? "https" : "http";
  }

  headers["x-forwarded-for"] = appendForwardedFor(
    headers["x-forwarded-for"],
    req.socket.remoteAddress
  );

  return headers;
}

function requestOptions(req, origin) {
  return {
    protocol: origin.protocol,
    hostname: origin.hostname,
    port:
      origin.port ||
      (origin.protocol === "https:" ? 443 : 80),
    method: req.method,
    path: req.url || "/",
    headers: requestHeadersForUpstream(req, origin)
  };
}

function proxyTransport(origin) {
  return origin.protocol === "https:" ? https : http;
}

function sendBadGateway(res) {
  if (res.headersSent) {
    res.destroy();
    return;
  }

  const body = "Bad Gateway\n";

  res.writeHead(502, {
    "content-type": "text/plain; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store"
  });

  res.end(body);
}

function proxyRequest(req, res, selected) {
  const transport = proxyTransport(selected.origin);
  const options = requestOptions(req, selected.origin);

  let upstreamResponseStarted = false;

  const upstreamReq = transport.request(options, (upstreamRes) => {
    upstreamResponseStarted = true;

    const responseHeaders = sanitizeHeaders(
      upstreamRes.headers
    );

    res.writeHead(
      upstreamRes.statusCode ?? 502,
      responseHeaders
    );

    upstreamRes.on("error", () => {
      res.destroy();
    });

    upstreamRes.pipe(res);
  });

  upstreamReq.on("error", () => {
    if (upstreamResponseStarted) {
      res.destroy();
      return;
    }

    sendBadGateway(res);
  });

  req.on("aborted", () => {
    upstreamReq.destroy();
  });

  req.on("error", () => {
    upstreamReq.destroy();
  });

  req.pipe(upstreamReq);
}

export function createGatewayServer(inputConfig) {
  const config = normalizeConfig(inputConfig);

  return http.createServer((req, res) => {
    try {
      const selected = selectUpstream(
        config,
        req.url || "/"
      );

      proxyRequest(req, res, selected);
    } catch {
      if (!res.headersSent) {
        const body = "Bad Gateway\n";

        res.writeHead(502, {
          "content-type": "text/plain; charset=utf-8",
          "content-length": Buffer.byteLength(body),
          "cache-control": "no-store"
        });

        res.end(body);
      } else {
        res.destroy();
      }
    }
  });
}

export async function startGateway(env = process.env) {
  const config = loadConfig(env);
  const server = createGatewayServer(config);

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

    server.listen(config.port, config.host);
  });

  return Object.freeze({
    server,
    config
  });
}

const directExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (directExecution) {
  try {
    const { server, config } = await startGateway();

    const address = server.address();

    if (
      !address ||
      typeof address === "string"
    ) {
      throw new Error("gateway listener address unavailable");
    }

    process.stdout.write(
      `CIVILIZATION_WEB_GATEWAY_LISTENING=${address.address}:${address.port}\n`
    );

    process.stdout.write(
      `PERSONAOS_ROUTE_TARGET=${config.personaRouteTarget}\n`
    );
  } catch (error) {
    process.stderr.write(
      `CIVILIZATION_WEB_GATEWAY_START_FAILED=${error.message}\n`
    );

    process.exitCode = 1;
  }
}
