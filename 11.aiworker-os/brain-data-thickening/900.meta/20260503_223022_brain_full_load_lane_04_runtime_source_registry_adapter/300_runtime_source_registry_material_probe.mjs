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

function materialCodesOf(response) {
  const codes = [];
  for (const domain of brainContextOf(response).domains || []) {
    for (const material of domain.materialSummaries || []) {
      if (material.unitCode) codes.push(material.unitCode);
    }
  }
  return codes;
}

function domainsOf(response) {
  return new Set((brainContextOf(response).domains || []).map((domain) => domain.brainDomainCode));
}

function assertCondition(name, condition, detail) {
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
  console.log(`PASS ${name}`);
}

const probes = [
  {
    name: "HD-R5P civilization source material",
    modelCode: "HD-R5P",
    purposeCode: "executive_planning",
    domains: "civilization_foundation_history",
    requireDomain: "civilization_foundation_history",
  },
  {
    name: "BYD2-003 history source material",
    modelCode: "BYD2-003",
    purposeCode: "review",
    domains: "history_worldview",
    requireDomain: "history_worldview",
  },
  {
    name: "HD-R3 exam source material",
    modelCode: "HD-R3",
    purposeCode: "exam_practice",
    domains: "exam_learning",
    requireDomain: "exam_learning",
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
      `&use_purpose_code=${encodeURIComponent(probe.purposeCode)}` +
      `&domains=${encodeURIComponent(probe.domains)}`;

    const response = await requestJson(port, path);
    const context = brainContextOf(response);
    const domains = domainsOf(response);
    const materialCodes = materialCodesOf(response);
    const hasSrcmat = materialCodes.some((code) => code.startsWith("srcmat_"));
    const hasPack = materialCodes.some((code) => code.startsWith("pack") || code.includes("_"));

    try {
      assertCondition(`${probe.name}: status`, response.statusCode === 200, `status=${response.statusCode}`);
      assertCondition(`${probe.name}: domain`, domains.has(probe.requireDomain), [...domains].sort().join(","));
      assertCondition(`${probe.name}: materialCount`, Number(context.materialCount || 0) > 0, `materialCount=${context.materialCount}`);
      assertCondition(`${probe.name}: source registry material`, hasSrcmat, materialCodes.slice(0, 80).join(","));
      assertCondition(`${probe.name}: has material list`, hasPack, materialCodes.slice(0, 80).join(","));

      console.log(`PROBE ${probe.name}`);
      console.log(`  model=${probe.modelCode} purpose=${probe.purposeCode} domains=${probe.domains}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  materialCodes=${materialCodes.slice(0, 80).join(",")}`);

      passCount += 1;
    } catch (error) {
      failCount += 1;
      console.log(`FAIL ${probe.name}`);
      console.log(`  error=${error && error.message ? error.message : String(error)}`);
      console.log(`  status=${response.statusCode}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  materialCodes=${materialCodes.slice(0, 120).join(",")}`);
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
