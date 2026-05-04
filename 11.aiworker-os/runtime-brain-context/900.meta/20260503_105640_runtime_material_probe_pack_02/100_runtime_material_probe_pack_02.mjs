import http from "node:http";
import { spawn } from "node:child_process";

const serverFile = process.env.SERVER_FILE;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";

if (!serverFile) {
  throw new Error("SERVER_FILE env required");
}

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
  const match = text.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  return match ? match[1] : null;
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
  for (let i = 0; i < 40; i += 1) {
    if (detectedPort) return detectedPort;
    await sleep(200);
    const port = readPort(serverOutput);
    if (port) {
      detectedPort = port;
      return detectedPort;
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
            reject(new Error(`JSON parse failed: ${error.message}\nstatus=${res.statusCode}\nbody=${body.slice(0, 800)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function brainContextOf(response) {
  return response.body?.data?.brain_context || {};
}

function promptOf(response) {
  return String(response.body?.data?.prompt_brain_context || "");
}

function domainsOf(response) {
  return new Set((brainContextOf(response).domains || []).map((domain) => domain.brainDomainCode));
}

function materialCodesOf(response) {
  const codes = [];
  for (const domain of brainContextOf(response).domains || []) {
    for (const material of domain.materialSummaries || []) {
      if (material.unitCode) codes.push(material.unitCode);
    }
  }
  return codes;
}

function hasMaterialPrefix(response, prefix) {
  return materialCodesOf(response).some((code) => code.startsWith(prefix));
}

function assertCondition(name, condition, detail) {
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
  console.log(`PASS ${name}`);
}

const probes = [
  {
    name: "HD-R5 business planning",
    modelCode: "HD-R5",
    purposeCode: "business_planning",
    requireDomains: ["business_operation"],
    requireAnyMaterialPrefix: ["pack02_biz_"],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 4,
    requirePromptText: "業務",
  },
  {
    name: "HD-R5 professional review",
    modelCode: "HD-R5",
    purposeCode: "review",
    requireDomains: ["professional_basic", "business_operation"],
    requireAnyMaterialPrefix: ["pack02_pro_", "pack02_biz_"],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 6,
    requirePromptText: "監査",
  },
  {
    name: "HD-R5P executive planning",
    modelCode: "HD-R5P",
    purposeCode: "executive_planning",
    requireDomains: ["civilization_foundation_history", "business_operation"],
    requireAnyMaterialPrefix: ["pack02_civ_", "pack02_biz_"],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 4,
    requirePromptText: "統治",
  },
  {
    name: "BYD2-003 review",
    modelCode: "BYD2-003",
    purposeCode: "review",
    requireDomains: ["business_operation", "professional_basic"],
    requireAnyMaterialPrefix: ["pack02_biz_", "pack02_pro_", "pack02_robot_", "pack02_civ_"],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 8,
    requirePromptText: "レビュー",
  },
  {
    name: "HD-R2 risk check",
    modelCode: "HD-R2",
    purposeCode: "risk_check",
    requireDomains: ["security_crisis"],
    requireAnyMaterialPrefix: ["pack02_sec_"],
    forbidDomains: ["business_operation", "professional_basic"],
    minMaterialCount: 4,
    requirePromptText: "現実の攻撃",
  },
  {
    name: "HD-R1C smalltalk forbidden check",
    modelCode: "HD-R1C",
    purposeCode: "smalltalk",
    requireDomains: ["food_nutrition"],
    requireAnyMaterialPrefix: [],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis", "civilization_foundation_history"],
    minMaterialCount: 1,
    requirePromptText: "material_summary=",
  },
];

let passCount = 0;
let failCount = 0;

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  const ready = await requestJson(port, "/aiworker/v1/runtime-execution/endpoint-ready");
  assertCondition("endpoint-ready", ready.statusCode === 200, `status=${ready.statusCode}`);
  passCount += 1;

  for (const probe of probes) {
    const path =
      `/aiworker/v1/runtime-execution/brain-context?model_code=${encodeURIComponent(probe.modelCode)}` +
      `&use_purpose_code=${encodeURIComponent(probe.purposeCode)}`;

    const response = await requestJson(port, path);
    const context = brainContextOf(response);
    const domains = domainsOf(response);
    const materialCodes = materialCodesOf(response);
    const prompt = promptOf(response);

    try {
      assertCondition(`${probe.name}: status`, response.statusCode === 200, `status=${response.statusCode}`);
      assertCondition(`${probe.name}: materialCount`, Number(context.materialCount || 0) >= probe.minMaterialCount, `materialCount=${context.materialCount}`);
      assertCondition(`${probe.name}: required domains`, probe.requireDomains.every((domain) => domains.has(domain)), [...domains].sort().join(","));
      assertCondition(`${probe.name}: forbidden domains`, !probe.forbidDomains.some((domain) => domains.has(domain)), [...domains].sort().join(","));

      if (probe.requireAnyMaterialPrefix.length > 0) {
        assertCondition(
          `${probe.name}: material prefix`,
          probe.requireAnyMaterialPrefix.some((prefix) => hasMaterialPrefix(response, prefix)),
          materialCodes.slice(0, 20).join(",")
        );
      }

      assertCondition(`${probe.name}: prompt text`, prompt.includes(probe.requirePromptText), `missing=${probe.requirePromptText}`);

      console.log(`PROBE ${probe.name}`);
      console.log(`  model=${probe.modelCode} purpose=${probe.purposeCode}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materials=${materialCodes.slice(0, 12).join(",")}`);

      passCount += 1;
    } catch (error) {
      failCount += 1;
      console.log(`FAIL ${probe.name}`);
      console.log(`  error=${error && error.message ? error.message : String(error)}`);
      console.log(`  status=${response.statusCode}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materials=${materialCodes.slice(0, 30).join(",")}`);
    }
  }

  console.log("============================================================");
  console.log(`PASS_COUNT=${passCount}`);
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
