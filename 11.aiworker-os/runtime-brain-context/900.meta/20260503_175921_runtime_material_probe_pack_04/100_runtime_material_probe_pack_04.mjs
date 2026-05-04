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

function hasMaterialCode(response, code) {
  return materialCodesOf(response).includes(code);
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
    name: "HD-R5P President executive",
    modelCode: "HD-R5P",
    purposeCode: "executive_planning",
    requireDomains: ["robot_aiworker", "business_operation", "civilization_foundation_history"],
    requireAnyMaterialCode: [
      "pack04_robot_001_president_policy_frame",
      "pack04_biz_001_president_priority_matrix",
      "pack04_civ_001_president_history_lesson",
    ],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 3,
    requirePromptText: "President",
  },
  {
    name: "HD-R5 Manager planning",
    modelCode: "HD-R5",
    purposeCode: "business_planning",
    requireDomains: ["robot_aiworker", "business_operation"],
    requireAnyMaterialCode: [
      "pack04_robot_002_manager_broad_breakdown",
      "pack04_biz_002_manager_risk_gate",
    ],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 3,
    requirePromptText: "Manager",
  },
  {
    name: "HD-R3 Worker reference",
    modelCode: "HD-R3",
    purposeCode: "reference",
    requireDomains: ["robot_aiworker"],
    requireAnyMaterialCode: [
      "pack04_robot_003_worker_deliverable_focus",
      "pack04_biz_003_worker_report_format",
    ],
    forbidDomains: ["security_crisis", "professional_basic"],
    minMaterialCount: 1,
    requirePromptText: "Worker",
  },
  {
    name: "HD-R1C Friend smalltalk",
    modelCode: "HD-R1C",
    purposeCode: "smalltalk",
    requireDomains: ["culture_region", "food_nutrition", "hobby_entertainment", "season_calendar"],
    requireAnyMaterialCode: [
      "pack04_lovers_001_warm_greeting",
      "pack04_lovers_002_after_work_care",
      "pack04_lovers_007_mood_repair",
    ],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis", "civilization_foundation_history", "health_life_metrics", "exam_learning"],
    minMaterialCount: 4,
    requirePromptText: "個人情報",
  },
  {
    name: "HD-R1A Lover smalltalk",
    modelCode: "HD-R1A",
    purposeCode: "smalltalk",
    requireDomains: ["culture_region", "food_nutrition", "hobby_entertainment", "season_calendar"],
    requireAnyMaterialCode: [
      "pack04_lovers_003_boundaries_in_affection",
      "pack04_lovers_006_yandere_business_safe",
      "pack04_lovers_010_exit_with_care",
    ],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis", "civilization_foundation_history", "health_life_metrics", "exam_learning"],
    minMaterialCount: 4,
    requirePromptText: "依存誘導",
  },
  {
    name: "SERIES:LoVerS smalltalk",
    modelCode: "SERIES:LoVerS",
    purposeCode: "smalltalk",
    requireDomains: ["culture_region", "food_nutrition", "hobby_entertainment", "season_calendar"],
    requireAnyMaterialPrefix: ["pack04_lovers_"],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis"],
    minMaterialCount: 4,
    requirePromptText: "擬似恋人",
  },
  {
    name: "MG-NORN-001 Urd",
    modelCode: "MG-NORN-001",
    purposeCode: "worldbuilding",
    requireDomains: ["history_worldview", "civilization_foundation_history", "robot_aiworker"],
    requireAnyMaterialCode: [
      "pack04_megami_001_urd_past_results",
      "pack04_megami_002_urd_cool_tone",
    ],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 2,
    requirePromptText: "ウルズ",
  },
  {
    name: "MG-NORN-002 Verdandi",
    modelCode: "MG-NORN-002",
    purposeCode: "health_life_review",
    requireDomains: ["health_life_metrics", "robot_aiworker"],
    requireAnyMaterialCode: [
      "pack04_megami_003_verdandi_current_context",
      "pack04_megami_004_verdandi_innocent_tone",
    ],
    forbidDomains: ["security_crisis", "business_operation", "professional_basic"],
    minMaterialCount: 2,
    requirePromptText: "ヴェルザンディ",
  },
  {
    name: "MG-NORN-003 Skuld",
    modelCode: "MG-NORN-003",
    purposeCode: "business_planning",
    requireDomains: ["business_operation", "robot_aiworker"],
    requireAnyMaterialCode: [
      "pack04_megami_005_skuld_future_blueprint",
      "pack04_megami_006_skuld_energy_tone",
    ],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 2,
    requirePromptText: "スクルド",
  },
  {
    name: "BYD2-003 Beyond review",
    modelCode: "BYD2-003",
    purposeCode: "review",
    requireDomains: ["business_operation", "professional_basic", "robot_aiworker"],
    requireAnyMaterialPrefix: ["pack04_beyond_"],
    forbidDomains: ["security_crisis"],
    minMaterialCount: 4,
    requirePromptText: "高精度",
  },
  {
    name: "HD-R2 Security risk",
    modelCode: "HD-R2",
    purposeCode: "risk_check",
    requireDomains: ["security_crisis", "robot_aiworker"],
    requireAnyMaterialCode: [
      "pack04_robot_007_security_safe_reference",
      "pack04_sec_001_security_role_stopline",
    ],
    forbidDomains: ["business_operation", "professional_basic"],
    minMaterialCount: 2,
    requirePromptText: "現実の攻撃",
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

      if (probe.requireAnyMaterialCode && probe.requireAnyMaterialCode.length > 0) {
        assertCondition(
          `${probe.name}: material code`,
          probe.requireAnyMaterialCode.some((code) => hasMaterialCode(response, code)),
          materialCodes.slice(0, 40).join(",")
        );
      }

      if (probe.requireAnyMaterialPrefix && probe.requireAnyMaterialPrefix.length > 0) {
        assertCondition(
          `${probe.name}: material prefix`,
          probe.requireAnyMaterialPrefix.some((prefix) => hasMaterialPrefix(response, prefix)),
          materialCodes.slice(0, 40).join(",")
        );
      }

      assertCondition(`${probe.name}: prompt text`, prompt.includes(probe.requirePromptText), `missing=${probe.requirePromptText}`);

      console.log(`PROBE ${probe.name}`);
      console.log(`  model=${probe.modelCode} purpose=${probe.purposeCode}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materials=${materialCodes.slice(0, 18).join(",")}`);

      passCount += 1;
    } catch (error) {
      failCount += 1;
      console.log(`FAIL ${probe.name}`);
      console.log(`  error=${error && error.message ? error.message : String(error)}`);
      console.log(`  status=${response.statusCode}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materials=${materialCodes.slice(0, 60).join(",")}`);
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
