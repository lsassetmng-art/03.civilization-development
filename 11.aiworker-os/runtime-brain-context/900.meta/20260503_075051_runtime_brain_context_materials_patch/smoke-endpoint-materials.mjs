import http from "node:http";
import { spawn } from "node:child_process";

const serverFile = process.env.SERVER_FILE;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";
if (!serverFile) throw new Error("SERVER_FILE env required");

const server = spawn(process.execPath, [serverFile], {
  env: { ...process.env, PERSONA_AIWORKEROS_AUTH_TOKEN: token },
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
  for (let i = 0; i < 30; i += 1) {
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
            reject(new Error(`JSON parse failed: ${error.message}\nstatus=${res.statusCode}\nbody=${body}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function domainsOf(response) {
  return new Set((response.body?.data?.brain_context?.domains || []).map((d) => d.brainDomainCode));
}

function materialCountOf(response) {
  return Number(response.body?.data?.brain_context?.materialCount || 0);
}

function promptOf(response) {
  return String(response.body?.data?.prompt_brain_context || "");
}

function assertCondition(name, condition, detail) {
  if (!condition) throw new Error(`${name}: ${detail}`);
  console.log(`PASS ${name}`);
}

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  const friend = await requestJson(port, "/aiworker/v1/runtime-execution/brain-context?model_code=HD-R1C&use_purpose_code=smalltalk");
  assertCondition("HD-R1C status", friend.statusCode === 200, friend.raw);
  assertCondition("HD-R1C materialCount", materialCountOf(friend) > 0, friend.raw);
  assertCondition("HD-R1C material summary text", promptOf(friend).includes("material_summary="), promptOf(friend));
  assertCondition("HD-R1C no forbidden", !["business_operation","professional_basic","security_crisis"].some((d) => domainsOf(friend).has(d)), [...domainsOf(friend)].join(","));

  const security = await requestJson(port, "/aiworker/v1/runtime-execution/brain-context?model_code=HD-R2&use_purpose_code=risk_check");
  assertCondition("HD-R2 status", security.statusCode === 200, security.raw);
  assertCondition("HD-R2 materialCount", materialCountOf(security) > 0, security.raw);
  assertCondition("HD-R2 security domain", domainsOf(security).has("security_crisis"), [...domainsOf(security)].join(","));
  assertCondition("HD-R2 safety text", promptOf(security).includes("現実の攻撃"), promptOf(security));
  assertCondition("HD-R2 no business/professional", !["business_operation","professional_basic"].some((d) => domainsOf(security).has(d)), [...domainsOf(security)].join(","));

  console.log("============================================================");
  console.log("PASS_COUNT=9");
  console.log("FAIL_COUNT=0");
  console.log("============================================================");
} finally {
  server.kill("SIGTERM");
  await sleep(200);
  if (serverOutput.trim()) {
    console.log("SERVER_OUTPUT_BEGIN");
    console.log(serverOutput.trim());
    console.log("SERVER_OUTPUT_END");
  }
}
