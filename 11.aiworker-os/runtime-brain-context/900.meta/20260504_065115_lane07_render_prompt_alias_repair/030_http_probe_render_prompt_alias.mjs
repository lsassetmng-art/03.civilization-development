import http from "node:http";
import { spawn } from "node:child_process";

const serverFile = process.env.SERVER_FILE;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";

const server = spawn(process.execPath, [serverFile], {
  env: {
    ...process.env,
    PERSONA_AIWORKEROS_AUTH_TOKEN: token,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
let detectedPort = null;

function readPort(text) {
  const m = text.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  return m ? m[1] : null;
}

server.stdout.on("data", (chunk) => {
  const t = chunk.toString();
  serverOutput += t;
  const p = readPort(t);
  if (p) detectedPort = p;
});

server.stderr.on("data", (chunk) => {
  const t = chunk.toString();
  serverOutput += t;
  const p = readPort(t);
  if (p) detectedPort = p;
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort() {
  for (let i = 0; i < 50; i++) {
    if (detectedPort) return detectedPort;
    await sleep(200);
    const p = readPort(serverOutput);
    if (p) {
      detectedPort = p;
      return p;
    }
  }
  throw new Error(`server port not detected\n${serverOutput}`);
}

function requestJson(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: "GET",
        host: "127.0.0.1",
        port,
        path,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => body += chunk);
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body), raw: body });
          } catch (e) {
            reject(new Error(`JSON parse failed: ${e.message}\nstatus=${res.statusCode}\nbody=${body.slice(0, 1200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function ctxOf(payload) {
  return payload?.data?.brain_context || payload?.data?.brainContext || payload?.brain_context || payload?.data || {};
}

function codesOf(ctx) {
  const out = [];
  for (const d of ctx.domains || []) {
    for (const m of d.materialSummaries || []) {
      if (m.unitCode) out.push(m.unitCode);
    }
  }
  return out;
}

function domainsOf(ctx) {
  return new Set((ctx.domains || []).map((d) => d.brainDomainCode));
}

function ok(label, cond, detail) {
  if (!cond) throw new Error(`${label}: ${detail}`);
  console.log(`PASS ${label}`);
}

const probes = [
  {
    label: "BYD2-003 review",
    model: "BYD2-003",
    purpose: "review",
    domains: "history_worldview,civilization_foundation_history,education_learning,exam_learning",
    requiredDomain: "history_worldview",
    requireSrcmat: true,
    requireLane05: true,
    requirePack05: true,
    forbidden: ["security_crisis"],
  },
  {
    label: "HD-R5P executive",
    model: "HD-R5P",
    purpose: "executive_planning",
    domains: "business_operation,civilization_foundation_history,robot_aiworker",
    requiredDomain: "business_operation",
    requireSrcmat: true,
    requireLane05: true,
    requirePack05: true,
    forbidden: ["security_crisis"],
  },
  {
    label: "HD-R1C smalltalk",
    model: "HD-R1C",
    purpose: "smalltalk",
    domains: "culture_region,food_nutrition,hobby_entertainment,season_calendar",
    requiredDomain: "food_nutrition",
    requireSrcmat: false,
    requireLane05: true,
    requirePack05: false,
    forbidden: ["business_operation","professional_basic","security_crisis","civilization_foundation_history","health_life_metrics","exam_learning"],
  },
  {
    label: "HD-R2 risk",
    model: "HD-R2",
    purpose: "risk_check",
    domains: "security_crisis,robot_aiworker,city_art_game",
    requiredDomain: "security_crisis",
    requireSrcmat: true,
    requireLane05: true,
    requirePack05: false,
    forbidden: ["business_operation","professional_basic"],
  },
];

let passCount = 0;
let failCount = 0;

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  const ready = await requestJson(port, "/aiworker/v1/runtime-execution/endpoint-ready");
  ok("endpoint-ready", ready.statusCode === 200, `status=${ready.statusCode}`);
  passCount++;

  for (const p of probes) {
    const path =
      `/aiworker/v1/runtime-execution/brain-context?model_code=${encodeURIComponent(p.model)}` +
      `&use_purpose_code=${encodeURIComponent(p.purpose)}` +
      `&purpose_code=${encodeURIComponent(p.purpose)}` +
      `&domains=${encodeURIComponent(p.domains)}` +
      `&limit_per_domain=20&total_limit=80`;

    try {
      const res = await requestJson(port, path);
      const ctx = ctxOf(res.body);
      const codes = codesOf(ctx);
      const domains = domainsOf(ctx);
      const forbiddenHits = [...domains].filter((d) => p.forbidden.includes(d));

      ok(`${p.label}: status`, res.statusCode === 200, `status=${res.statusCode} raw=${res.raw?.slice?.(0, 500)}`);
      ok(`${p.label}: provider`, ctx.providerVersion === "lane07-selector-v1", `providerVersion=${ctx.providerVersion}`);
      ok(`${p.label}: selector`, ctx.selectorFunction === "aiworker.fn_robot_brain_runtime_material_select_v1", `selectorFunction=${ctx.selectorFunction}`);
      ok(`${p.label}: materialCount`, Number(ctx.materialCount || 0) > 0, `materialCount=${ctx.materialCount}`);
      ok(`${p.label}: requiredDomain`, domains.has(p.requiredDomain), [...domains].join(","));
      ok(`${p.label}: forbiddenDomains`, forbiddenHits.length === 0, forbiddenHits.join(","));

      if (p.requireSrcmat) ok(`${p.label}: srcmat`, codes.some((c) => c.startsWith("srcmat_")), codes.slice(0, 80).join(","));
      if (p.requireLane05) ok(`${p.label}: lane05`, codes.some((c) => c.startsWith("lane05_")), codes.slice(0, 80).join(","));
      if (p.requirePack05) ok(`${p.label}: pack05`, codes.some((c) => c.startsWith("pack05_")), codes.slice(0, 80).join(","));

      console.log(`PROBE ${p.label}`);
      console.log(`  materialCount=${ctx.materialCount} domainCount=${ctx.domainCount}`);
      console.log(`  srcmatCount=${ctx.srcmatCount} lane05Count=${ctx.lane05Count} pack05Count=${ctx.pack05Count}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materialCodes=${codes.slice(0, 100).join(",")}`);

      passCount++;
    } catch (e) {
      failCount++;
      console.log(`FAIL ${p.label}`);
      console.log(`  error=${e && e.message ? e.message : String(e)}`);
    }
  }

  console.log("============================================================");
  console.log(`PASS_COUNT=${passCount}`);
  console.log(`FAIL_COUNT=${failCount}`);
  console.log("============================================================");

  if (failCount > 0) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  await sleep(250);
  if (serverOutput.trim()) {
    console.log("SERVER_OUTPUT_BEGIN");
    console.log(serverOutput.trim());
    console.log("SERVER_OUTPUT_END");
  }
}
