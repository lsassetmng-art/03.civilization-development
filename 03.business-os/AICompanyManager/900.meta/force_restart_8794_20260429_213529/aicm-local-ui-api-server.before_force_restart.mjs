import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const BUSINESS_OS_ROOT = path.resolve(APP_ROOT, "..");
const AIWORKER_ROOT = path.resolve(BUSINESS_OS_ROOT, "_aiworker");
const PORT = Number(process.env.AICM_LOCAL_UI_PORT || process.env.PORT || 8794);
const HOST = process.env.AICM_LOCAL_UI_HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj, null, 2), "application/json; charset=utf-8");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value || "/");
  } catch {
    return "/";
  }
}

function safeJoin(root, requestPath) {
  const clean = String(requestPath || "/").replace(/^\/+/, "");
  const full = path.resolve(root, clean);
  const rootResolved = path.resolve(root);
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return full;
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function serveFile(res, filePath) {
  if (!filePath || !fileExists(filePath)) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);

  res.writeHead(200, {
    "content-type": type,
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });

  stream.on("error", (err) => {
    if (!res.headersSent) {
      sendJson(res, 500, {
        result: "error",
        error_code: "STREAM_ERROR",
        message: String(err && err.message || err)
      });
    } else {
      res.destroy(err);
    }
  });

  stream.pipe(res);
  return true;
}

function resolveRequestPath(req) {
  const rawUrl = typeof req.url === "string" && req.url.length > 0 ? req.url : "/";
  const parsed = new URL(rawUrl, "http://127.0.0.1");
  let pathname = safeDecode(parsed.pathname || "/");

  if (pathname === "/" || pathname === "") {
    return path.join(APP_ROOT, "index.html");
  }

  if (pathname === "/favicon.ico") {
    return null;
  }

  if (pathname.startsWith("/_aiworker/")) {
    const rel = pathname.replace(/^\/_aiworker\/?/, "");
    return safeJoin(AIWORKER_ROOT, rel);
  }

  return safeJoin(APP_ROOT, pathname);
}

const server = http.createServer((req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      res.end();
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, {
        result: "error",
        error_code: "METHOD_NOT_ALLOWED",
        message: "Only GET/HEAD is supported by local UI static server."
      });
      return;
    }

    const filePath = resolveRequestPath(req);

    if (filePath === null && String(req.url || "").startsWith("/favicon.ico")) {
      res.writeHead(204, { "cache-control": "no-store" });
      res.end();
      return;
    }

    if (filePath && serveFile(res, filePath)) {
      return;
    }

    // SPA fallback: only for non-asset routes.
    const pathname = safeDecode(new URL(String(req.url || "/"), "http://127.0.0.1").pathname || "/");
    const looksLikeAsset = /\.[a-zA-Z0-9]+$/.test(pathname) || pathname.startsWith("/assets/") || pathname.startsWith("/_aiworker/");
    if (!looksLikeAsset) {
      const indexPath = path.join(APP_ROOT, "index.html");
      if (serveFile(res, indexPath)) return;
    }

    sendJson(res, 404, {
      result: "error",
      error_code: "NOT_FOUND",
      message: "File not found",
      request_url: req.url || "/",
      app_root: APP_ROOT
    });
  } catch (err) {
    sendJson(res, 500, {
      result: "error",
      error_code: "SERVER_EXCEPTION",
      message: String(err && err.message || err),
      stack_head: String(err && err.stack || "").split("\n").slice(0, 5)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[AICompanyManager local UI] listening on http://${HOST}:${PORT}/`);
  console.log(`[AICompanyManager local UI] APP_ROOT=${APP_ROOT}`);
  console.log(`[AICompanyManager local UI] AIWORKER_ROOT=${AIWORKER_ROOT}`);
});
