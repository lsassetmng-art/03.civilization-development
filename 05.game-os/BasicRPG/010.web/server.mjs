import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const WEB_DIR = fileURLToPath(new URL(".", import.meta.url));
const SRC_DIR = join(WEB_DIR, "src");
const SHARED_DIR = normalize(join(WEB_DIR, "..", "020.shared-js", "src"));
const PORT = Number(process.env.PORT || 4173);

const MIME = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
});

function safePath(root, requestPath) {
  const clean = normalize(requestPath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");

  const target = join(root, clean);

  if (!target.startsWith(root)) {
    return null;
  }

  return target;
}

function writeJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function proxyBuilder(request, response, requestUrl) {
  const targetBase = process.env.GAMEOS_BUILDER_FUNCTION_URL;

  if (!targetBase) {
    writeJson(response, 503, {
      errorCode: "GAME_BUILDER_API_NOT_CONFIGURED",
      errorMessage: "GAMEOS_BUILDER_FUNCTION_URL is not configured.",
      errorState: "blocked",
      retryAllowed: false
    });
    return;
  }

  const target = new URL(targetBase);

  for (const [key, value] of requestUrl.searchParams) {
    target.searchParams.set(key, value);
  }

  let body;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    body = Buffer.concat(chunks);
  }

  const headers = {
    Accept: "application/json"
  };

  const authorization = request.headers.authorization;

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (process.env.GAMEOS_SUPABASE_ANON_KEY) {
    headers.apikey = process.env.GAMEOS_SUPABASE_ANON_KEY;
  }

  if (body?.length) {
    headers["Content-Type"] =
      request.headers["content-type"] || "application/json";
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body
  });

  const bytes = Buffer.from(await upstream.arrayBuffer());

  response.writeHead(upstream.status, {
    "Content-Type":
      upstream.headers.get("content-type") ||
      "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  response.end(bytes);
}

async function serveFile(response, filePath) {
  try {
    const info = await stat(filePath);

    if (!info.isFile()) {
      return false;
    }

    response.writeHead(200, {
      "Content-Type":
        MIME[extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "Cache-Control": "no-cache"
    });

    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(
      request.url || "/",
      `http://${request.headers.host || "127.0.0.1"}`
    );

    if (requestUrl.pathname === "/game/builder/projects") {
      await proxyBuilder(request, response, requestUrl);
      return;
    }

    if (requestUrl.pathname.startsWith("/shared/")) {
      const filePath = safePath(
        SHARED_DIR,
        requestUrl.pathname.slice("/shared/".length)
      );

      if (filePath && await serveFile(response, filePath)) {
        return;
      }

      writeJson(response, 404, {
        errorCode: "GAME_BUILDER_STATIC_NOT_FOUND",
        errorMessage: "Shared resource not found.",
        errorState: "failed",
        retryAllowed: false
      });
      return;
    }

    const relative =
      requestUrl.pathname === "/"
        ? "index.html"
        : requestUrl.pathname.slice(1);

    const filePath = safePath(SRC_DIR, relative);

    if (filePath && await serveFile(response, filePath)) {
      return;
    }

    writeJson(response, 404, {
      errorCode: "GAME_BUILDER_ROUTE_NOT_FOUND",
      errorMessage: "Builder route not found.",
      errorState: "failed",
      retryAllowed: false
    });
  } catch (error) {
    writeJson(response, 500, {
      errorCode: "GAME_BUILDER_SERVER_FAILED",
      errorMessage: error.message,
      errorState: "failed",
      retryAllowed: false
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`GameOS Builder listening on http://127.0.0.1:${PORT}\n`);
});
