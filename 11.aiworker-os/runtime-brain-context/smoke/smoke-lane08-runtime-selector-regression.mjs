import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultServerFile = path.resolve(__dirname, "../../runtime-execution-http-api/server.js");
const serverFile = process.env.SERVER_FILE || defaultServerFile;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";

const promptWarnChars = Number.parseInt(process.env.AIWORKER_PROMPT_WARN_CHARS || "120000", 10);
const promptMaxChars = Number.parseInt(process.env.AIWORKER_PROMPT_MAX_CHARS || "240000", 10);

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
  const text = chunk.toString();
  serverOutput += text;
  const port = readPort(text);
  if (port) detectedPort = port;
});

server.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  serverOutput += text;
  const port = readPort(text);
  if (port) detectedPort = port;
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort() {
  for (let i = 0; i < 50; i += 1) {
    if (detectedPort) return detectedPort;
    await sleep(200);
    const port = readPort(serverOutput);
    if (port) {
      detectedPort = port;
      return port;
    }
  }
  throw new Error(`server port not detected\n${serverOutput}`);
}

function requestJson(port, pathName) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: "GET",
        host: "127.0.0.1",
        port,
        path: pathName,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(body),
              raw: body,
            });
          } catch (error) {
            reject(new Error(`JSON parse failed: ${error.message}\nstatus=${res.statusCode}\nbody=${body.slice(0, 1200)}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function contextOf(payload) {
  return payload?.data?.brain_context || payload?.data?.brainContext || payload?.brain_context || payload?.data || {};
}

function promptOf(payload) {
  return payload?.data?.prompt_brain_context || payload?.data?.promptBrainContext || "";
}

function materialCodes(context) {
  const out = [];
  for (const domain of context.domains || []) {
    for (const material of domain.materialSummaries || []) {
      if (material.unitCode) out.push(material.unitCode);
    }
  }
  return out;
}

function domainSet(context) {
  return new Set((context.domains || []).map((domain) => domain.brainDomainCode));
}

function assertOk(label, condition, detail) {
  if (!condition) {
    throw new Error(`${label}: ${detail}`);
  }
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
    forbidden: [
      "business_operation",
      "professional_basic",
      "security_crisis",
      "civilization_foundation_history",
      "health_life_metrics",
      "exam_learning",
    ],
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
    forbidden: ["business_operation", "professional_basic"],
  },
];

let passCount = 0;
let failCount = 0;
let warnCount = 0;

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  const ready = await requestJson(port, "/aiworker/v1/runtime-execution/endpoint-ready");
  assertOk("endpoint-ready", ready.statusCode === 200, `status=${ready.statusCode}`);
  passCount += 1;

  for (const probe of probes) {
    const pathName =
      `/aiworker/v1/runtime-execution/brain-context?model_code=${encodeURIComponent(probe.model)}` +
      `&use_purpose_code=${encodeURIComponent(probe.purpose)}` +
      `&purpose_code=${encodeURIComponent(probe.purpose)}` +
      `&domains=${encodeURIComponent(probe.domains)}` +
      `&limit_per_domain=20` +
      `&total_limit=80`;

    try {
      const response = await requestJson(port, pathName);
      const context = contextOf(response.body);
      const prompt = promptOf(response.body);
      const codes = materialCodes(context);
      const domains = domainSet(context);
      const forbiddenHits = [...domains].filter((domain) => probe.forbidden.includes(domain));
      const promptChars = prompt.length;
      const promptLines = prompt ? prompt.split("\n").length : 0;

      assertOk(`${probe.label}: status`, response.statusCode === 200, `status=${response.statusCode}`);
      assertOk(`${probe.label}: provider`, context.providerVersion === "lane07-selector-v1", `providerVersion=${context.providerVersion}`);
      assertOk(`${probe.label}: selector`, context.selectorFunction === "aiworker.fn_robot_brain_runtime_material_select_v1", `selectorFunction=${context.selectorFunction}`);
      assertOk(`${probe.label}: selector mode`, context.selectorMode === "two_stage_domain_then_overall_rank", `selectorMode=${context.selectorMode}`);
      assertOk(`${probe.label}: materialCount`, Number(context.materialCount || 0) > 0, `materialCount=${context.materialCount}`);
      assertOk(`${probe.label}: material limit`, Number(context.materialCount || 0) <= 80, `materialCount=${context.materialCount}`);
      assertOk(`${probe.label}: required domain`, domains.has(probe.requiredDomain), [...domains].join(","));
      assertOk(`${probe.label}: forbidden domains`, forbiddenHits.length === 0, forbiddenHits.join(","));
      assertOk(`${probe.label}: prompt marker`, prompt.includes("[AIWORKER_BRAIN_CONTEXT]") && prompt.includes("[/AIWORKER_BRAIN_CONTEXT]"), "prompt marker missing");
      assertOk(`${probe.label}: prompt max chars`, promptChars <= promptMaxChars, `promptChars=${promptChars} max=${promptMaxChars}`);

      if (promptChars > promptWarnChars) {
        warnCount += 1;
        console.log(`WARN ${probe.label}: prompt size high promptChars=${promptChars} warn=${promptWarnChars}`);
      }

      if (probe.requireSrcmat) {
        assertOk(`${probe.label}: srcmat`, codes.some((code) => code.startsWith("srcmat_")), codes.slice(0, 80).join(","));
      }

      if (probe.requireLane05) {
        assertOk(`${probe.label}: lane05`, codes.some((code) => code.startsWith("lane05_")), codes.slice(0, 80).join(","));
      }

      if (probe.requirePack05) {
        assertOk(`${probe.label}: pack05`, codes.some((code) => code.startsWith("pack05_")), codes.slice(0, 80).join(","));
      }

      console.log(`PROBE ${probe.label}`);
      console.log(`  model=${probe.model} purpose=${probe.purpose}`);
      console.log(`  materialCount=${context.materialCount} domainCount=${context.domainCount}`);
      console.log(`  srcmatCount=${context.srcmatCount} lane05Count=${context.lane05Count} pack05Count=${context.pack05Count}`);
      console.log(`  promptChars=${promptChars} promptLines=${promptLines}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materialCodes=${codes.slice(0, 100).join(",")}`);

      passCount += 1;
    } catch (error) {
      failCount += 1;
      console.log(`FAIL ${probe.label}`);
      console.log(`  error=${error && error.message ? error.message : String(error)}`);
    }
  }

  console.log("============================================================");
  console.log(`PASS_COUNT=${passCount}`);
  console.log(`WARN_COUNT=${warnCount}`);
  console.log(`FAIL_COUNT=${failCount}`);
  console.log("============================================================");

  if (failCount > 0) {
    process.exitCode = 1;
  }
} finally {
  server.kill("SIGTERM");
  await sleep(250);

  if (serverOutput.trim()) {
    console.log("SERVER_OUTPUT_BEGIN");
    console.log(serverOutput.trim());
    console.log("SERVER_OUTPUT_END");
  }
}
