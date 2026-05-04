import http from "node:http";
import { spawn } from "node:child_process";

const serverFile = process.env.SERVER_FILE;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";

const probes = [
  ["HD-R5P","executive_planning","robot_aiworker,business_operation,civilization_foundation_history"],
  ["HD-R5","business_planning","robot_aiworker,business_operation"],
  ["HD-R3","reference","robot_aiworker,business_operation"],
  ["HD-R1C","smalltalk","culture_region,food_nutrition,hobby_entertainment,season_calendar"],
  ["HD-R1A","smalltalk","culture_region,food_nutrition,hobby_entertainment,season_calendar"],
  ["SERIES:LoVerS","smalltalk","culture_region,food_nutrition,hobby_entertainment,season_calendar"],
  ["MG-NORN-001","worldbuilding","history_worldview,civilization_foundation_history,robot_aiworker"],
  ["MG-NORN-002","health_life_review","health_life_metrics,robot_aiworker,hobby_entertainment"],
  ["MG-NORN-003","business_planning","business_operation,robot_aiworker,hobby_entertainment"],
  ["BYD2-003","review","business_operation,professional_basic,robot_aiworker"],
  ["HD-R2","risk_check","security_crisis,robot_aiworker"]
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readPort(text) {
  const match = text.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  return match ? match[1] : null;
}

function requestJson(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: "GET",
        host: "127.0.0.1",
        port,
        path,
        headers: { Authorization: `Bearer ${token}` },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body), raw: body });
          } catch (error) {
            reject(new Error(`JSON parse failed: ${error.message}\nstatus=${res.statusCode}\nbody=${body.slice(0, 800)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function contextOf(response) {
  return response.body?.data?.brain_context || {};
}

function promptOf(response) {
  return String(response.body?.data?.prompt_brain_context || "");
}

function domainsOf(response) {
  return (contextOf(response).domains || []).map((domain) => domain.brainDomainCode);
}

function materialsOf(response) {
  const rows = [];
  for (const domain of contextOf(response).domains || []) {
    for (const material of domain.materialSummaries || []) {
      rows.push({
        domain: domain.brainDomainCode,
        code: material.unitCode,
        title: material.unitTitleJa,
        summary: material.unitSummaryJa,
        safety: material.safetyBoundaryJa,
      });
    }
  }
  return rows;
}

if (!serverFile) {
  throw new Error("SERVER_FILE env required");
}

const server = spawn(process.execPath, [serverFile], {
  env: { ...process.env, PERSONA_AIWORKEROS_AUTH_TOKEN: token },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
let port = null;

server.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  const p = readPort(text);
  if (p) port = p;
});
server.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  const p = readPort(text);
  if (p) port = p;
});

try {
  for (let i = 0; i < 40; i += 1) {
    if (port) break;
    await sleep(200);
    const p = readPort(output);
    if (p) port = p;
  }

  if (!port) throw new Error(`port not detected\n${output}`);

  console.log(`DETECTED_PORT=${port}`);

  for (const [modelCode, purposeCode, domains] of probes) {
    const basePath = `/aiworker/v1/runtime-execution/brain-context?model_code=${encodeURIComponent(modelCode)}&use_purpose_code=${encodeURIComponent(purposeCode)}`;
    const domainPath = `${basePath}&domains=${encodeURIComponent(domains)}`;

    const base = await requestJson(port, basePath);
    const filtered = await requestJson(port, domainPath);

    const baseMaterials = materialsOf(base);
    const filteredMaterials = materialsOf(filtered);
    const basePack04 = baseMaterials.filter((m) => m.code?.startsWith("pack04_"));
    const filteredPack04 = filteredMaterials.filter((m) => m.code?.startsWith("pack04_"));

    console.log("------------------------------------------------------------");
    console.log(`PROBE=${modelCode} purpose=${purposeCode}`);
    console.log(`BASE status=${base.statusCode} source=${contextOf(base).sourceCount} domain=${contextOf(base).domainCount} material=${contextOf(base).materialCount}`);
    console.log(`BASE domains=${domainsOf(base).join(",")}`);
    console.log(`BASE pack04_count=${basePack04.length}`);
    console.log(`BASE pack04_materials=${basePack04.map((m) => m.code).slice(0, 30).join(",")}`);
    console.log(`FILTERED status=${filtered.statusCode} source=${contextOf(filtered).sourceCount} domain=${contextOf(filtered).domainCount} material=${contextOf(filtered).materialCount}`);
    console.log(`FILTERED domains=${domainsOf(filtered).join(",")}`);
    console.log(`FILTERED pack04_count=${filteredPack04.length}`);
    console.log(`FILTERED pack04_materials=${filteredPack04.map((m) => m.code).slice(0, 40).join(",")}`);

    const prompt = promptOf(base);
    const likelyPromptTruncated =
      basePack04.length > 0 &&
      !prompt.includes("pack04_") &&
      baseMaterials.length > 8;

    console.log(`PROMPT_LEN=${prompt.length}`);
    console.log(`PROMPT_HAS_PACK04=${prompt.includes("pack04_") ? "YES" : "NO"}`);
    console.log(`LIKELY_PROMPT_TRUNCATED=${likelyPromptTruncated ? "YES" : "NO"}`);
  }
} finally {
  server.kill("SIGTERM");
  await sleep(250);
  if (output.trim()) {
    console.log("SERVER_OUTPUT_BEGIN");
    console.log(output.trim());
    console.log("SERVER_OUTPUT_END");
  }
}
