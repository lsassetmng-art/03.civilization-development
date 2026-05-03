import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const BUSINESS_OS_ROOT = path.resolve(APP_ROOT, "..");
const AIWORKER_ROOT = path.resolve(BUSINESS_OS_ROOT, "_aiworker");
const PORT = 8794;
const HOST = "127.0.0.1";
const SERVER_MARK = "AICM_LOCAL_UI_STATIC_SERVER_ACU_ACX_V1";

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
    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "pragma": "no-cache",
    "expires": "0",
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
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) return null;
  return full;
}

function fileExists(filePath) {
  try {
    return !!filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function serveFile(res, filePath) {
  if (!fileExists(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, {
    "content-type": type,
    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "access-control-allow-origin": "*",
    "x-aicm-local-ui-server": SERVER_MARK
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function resolveFile(reqUrl) {
  const parsed = new URL(String(reqUrl || "/"), "http://127.0.0.1");
  const pathname = safeDecode(parsed.pathname || "/");

  if (pathname === "/" || pathname === "") {
    return path.join(APP_ROOT, "index.html");
  }

  if (pathname === "/favicon.ico") return null;

  if (pathname.startsWith("/_aiworker/")) {
    return safeJoin(AIWORKER_ROOT, pathname.replace(/^\/_aiworker\/?/, ""));
  }

  return safeJoin(APP_ROOT, pathname);
}

const server = http.createServer((req, res) => {
  try {
    const url = String(req.url || "/");

    if (url.startsWith("/__aicm_health")) {
      sendJson(res, 200, {
        result: "ok",
        server_mark: SERVER_MARK,
        app_root: APP_ROOT,
        aiworker_root: AIWORKER_ROOT,
        index_exists: fileExists(path.join(APP_ROOT, "index.html"))
      });
      return;
    }

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
      sendJson(res, 405, { result: "error", error_code: "METHOD_NOT_ALLOWED" });
      return;
    }

    const filePath = resolveFile(url);

    if (filePath === null) {
      res.writeHead(204, { "cache-control": "no-store" });
      res.end();
      return;
    }

    if (serveFile(res, filePath)) return;

    const pathname = safeDecode(new URL(url, "http://127.0.0.1").pathname || "/");
    const looksLikeAsset = /\.[a-zA-Z0-9]+$/.test(pathname) || pathname.startsWith("/assets/") || pathname.startsWith("/_aiworker/");
    if (!looksLikeAsset && serveFile(res, path.join(APP_ROOT, "index.html"))) return;

    sendJson(res, 404, {
      result: "error",
      error_code: "NOT_FOUND",
      server_mark: SERVER_MARK,
      request_url: url
    });
  } catch (err) {
    sendJson(res, 500, {
      result: "error",
      error_code: "SERVER_EXCEPTION",
      server_mark: SERVER_MARK,
      message: String(err && err.message || err)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(SERVER_MARK);
  console.log("listening=http://" + HOST + ":" + PORT + "/");
  console.log("APP_ROOT=" + APP_ROOT);
});
