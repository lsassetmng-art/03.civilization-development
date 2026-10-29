import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";

const HOST = "127.0.0.1";
const PORT = 3108;
const PORTAL = "http://127.0.0.1:3110";

const codes = new Map();

function send(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (
    req.method === "GET" &&
    url.pathname === "/health"
  ) {
    return send(res, 200, { ok: true });
  }

  if (
    req.method === "GET" &&
    url.pathname === "/api/civilization/auth/continue"
  ) {
    const state = url.searchParams.get("handoff_state");
    const challenge = url.searchParams.get("code_challenge");
    const method = url.searchParams.get("code_challenge_method");

    if (
      !state ||
      !challenge ||
      method !== "S256"
    ) {
      return send(res, 400, { error: "invalid_request" });
    }

    const code = randomBytes(32).toString("base64url");

    codes.set(code, {
      state,
      challenge
    });

    const callback = new URL(
      "/api/persona/auth/callback",
      PORTAL
    );

    callback.searchParams.set("code", code);
    callback.searchParams.set("state", state);

    res.writeHead(302, {
      location: callback.toString(),
      "cache-control": "no-store"
    });

    return res.end();
  }

  if (
    req.method === "POST" &&
    url.pathname ===
      "/api/civilization/auth/handoff/persona-exchange"
  ) {
    let raw = "";

    for await (const chunk of req) {
      raw += chunk;

      if (raw.length > 16384) {
        return send(res, 413, { error: "too_large" });
      }
    }

    let body;

    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "invalid_json" });
    }

    const record = codes.get(body.code);

    if (!record) {
      return send(res, 401, { error: "invalid_code" });
    }

    // One-time consumption, including failed attempts.
    codes.delete(body.code);

    if (
      typeof body.code_verifier !== "string" ||
      body.state !== record.state
    ) {
      return send(res, 401, { error: "invalid_handoff" });
    }

    const calculated = createHash("sha256")
      .update(body.code_verifier, "utf8")
      .digest("base64url");

    if (calculated !== record.challenge) {
      return send(res, 401, { error: "invalid_pkce" });
    }

    return send(res, 200, {
      server_session_actor_key: "r20-mock-actor"
    });
  }

  send(res, 404, { error: "not_found" });
});

server.listen(PORT, HOST, () => {
  console.log(`R20_MOCK_READY=${HOST}:${PORT}`);
});
