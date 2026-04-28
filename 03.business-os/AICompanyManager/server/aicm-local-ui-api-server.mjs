import http from "http";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const host = "127.0.0.1";
const port = Number(process.env.PORT || "8794");
const root = process.env.ROOT;
const dbUrl = process.env.PERSONA_DATABASE_URL;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8"
};

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body, null, 2));
}

function safeFile(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  const file = clean === "/" ? "index.html" : clean.replace(/^\/+/g, "");
  const full = path.resolve(root, file);
  const base = path.resolve(root);
  if (!full.startsWith(base)) return null;
  return full;
}

function runPsqlJson() {
  if (!dbUrl) {
    return {
      ok: false,
      status: 500,
      body: {
        result: "error",
        error_code: "PERSONA_DATABASE_URL_NOT_SET",
        message: "PERSONA_DATABASE_URL is not set in local API server environment."
      }
    };
  }

  const sql = `
\\pset format unaligned
\\pset tuples_only on
\\set ON_ERROR_STOP on

BEGIN READ ONLY;

WITH
robot_pool_rows AS (
  SELECT coalesce(jsonb_agg(to_jsonb(rp) ORDER BY to_jsonb(rp)::text), '[]'::jsonb) AS rows
  FROM business.robot_pool rp
),
role_catalog_rows AS (
  SELECT coalesce(jsonb_agg(to_jsonb(rc) ORDER BY to_jsonb(rc)::text), '[]'::jsonb) AS rows
  FROM business.robot_placement_role_catalog rc
)
SELECT jsonb_build_object(
  'result', 'ok',
  'source', 'business_db_readonly',
  'provider', 'business.robot_pool',
  'role_catalog_provider', 'business.robot_placement_role_catalog',
  'assignment_policy', 'unlimited_system_use',
  'quantity_consumption', false,
  'robots', robot_pool_rows.rows,
  'role_catalog', role_catalog_rows.rows,
  'counts', jsonb_build_object(
    'robot_pool', jsonb_array_length(robot_pool_rows.rows),
    'role_catalog', jsonb_array_length(role_catalog_rows.rows)
  )
)::text
FROM robot_pool_rows, role_catalog_rows;

ROLLBACK;
`;

  const result = spawnSync("psql", [dbUrl], {
    input: sql,
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 1024 * 1024 * 8
  });

  if (result.error) {
    return {
      ok: false,
      status: 500,
      body: {
        result: "error",
        error_code: "PSQL_EXEC_ERROR",
        message: result.error.message
      }
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      status: 500,
      body: {
        result: "error",
        error_code: "PSQL_FAILED",
        psql_status: result.status,
        stderr: result.stderr,
        stdout_tail: String(result.stdout || "").slice(-2000)
      }
    };
  }

  const jsonLine = String(result.stdout || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith("{") && line.endsWith("}"))
    .pop();

  if (!jsonLine) {
    return {
      ok: false,
      status: 500,
      body: {
        result: "error",
        error_code: "NO_JSON_FROM_PSQL",
        stdout_tail: String(result.stdout || "").slice(-2000),
        stderr: result.stderr
      }
    };
  }

  try {
    return {
      ok: true,
      status: 200,
      body: JSON.parse(jsonLine)
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      body: {
        result: "error",
        error_code: "JSON_PARSE_FAILED",
        message: error.message,
        json_line_head: jsonLine.slice(0, 300)
      }
    };
  }
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://" + host + ":" + port);

    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, {
        result: "ok",
        service: "AICompanyManager local UI/API server",
        root,
        api: ["/api/aicm/business-robot-pool"]
      });
    }

    if (req.method === "GET" && url.pathname === "/api/aicm/business-robot-pool") {
      const psqlResult = runPsqlJson();
      return json(res, psqlResult.status, psqlResult.body);
    }

    const full = safeFile(req.url);

    if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.writeHead(404, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      });
      res.end("not found");
      return;
    }

    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      "content-type": types[ext] || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(fs.readFileSync(full));
  } catch (error) {
    json(res, 500, {
      result: "error",
      error_code: "SERVER_EXCEPTION",
      message: error && error.message ? error.message : String(error)
    });
  }
});

server.listen(port, host, () => {
  console.log("AICompanyManager local UI/API server listening on http://" + host + ":" + port + "/");
  console.log("ROOT=" + root);
  console.log("API=/api/aicm/business-robot-pool");
});
