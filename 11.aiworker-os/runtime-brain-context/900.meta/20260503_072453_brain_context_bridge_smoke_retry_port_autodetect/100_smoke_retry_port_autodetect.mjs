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

function requestJson(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: "GET",
        host: "127.0.0.1",
        port,
        path: pathname,
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
            reject(new Error(`JSON parse failed: ${error.message}\nstatus=${res.statusCode}\nbody=${body}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function getDomains(response) {
  return new Set(
    (((response.body || {}).data || {}).brain_context || {}).domains?.map((domain) => domain.brainDomainCode) || []
  );
}

function assertCondition(name, condition, detail) {
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
  console.log(`PASS ${name}`);
}

let passCount = 0;

async function pass(name, fn) {
  await fn();
  passCount += 1;
}

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  await pass("endpoint-ready status", async () => {
    const ready = await requestJson(port, "/aiworker/v1/runtime-execution/endpoint-ready");
    assertCondition("endpoint-ready status", ready.statusCode === 200, `status=${ready.statusCode} raw=${ready.raw}`);
  });

  await pass("HD-R1C brain-context status", async () => {
    const friend = await requestJson(port, "/aiworker/v1/runtime-execution/brain-context?model_code=HD-R1C&use_purpose_code=smalltalk");
    assertCondition("HD-R1C brain-context status", friend.statusCode === 200, `status=${friend.statusCode} raw=${friend.raw}`);

    const friendDomains = getDomains(friend);
    assertCondition(
      "HD-R1C has smalltalk domain",
      ["food_nutrition", "season_calendar", "culture_region"].some((x) => friendDomains.has(x)),
      [...friendDomains].join(",")
    );
    assertCondition(
      "HD-R1C no forbidden domains",
      !["business_operation", "professional_basic", "security_crisis"].some((x) => friendDomains.has(x)),
      [...friendDomains].join(",")
    );
    assertCondition(
      "HD-R1C prompt text exists",
      String(friend.body.data.prompt_brain_context || "").includes("[AIWORKER_BRAIN_CONTEXT]"),
      "missing prompt marker"
    );
  });

  await pass("HD-R2 brain-context status", async () => {
    const security = await requestJson(port, "/aiworker/v1/runtime-execution/brain-context?model_code=HD-R2&use_purpose_code=risk_check");
    assertCondition("HD-R2 brain-context status", security.statusCode === 200, `status=${security.statusCode} raw=${security.raw}`);

    const securityDomains = getDomains(security);
    assertCondition("HD-R2 has security_crisis", securityDomains.has("security_crisis"), [...securityDomains].join(","));
    assertCondition(
      "HD-R2 no business/professional",
      !["business_operation", "professional_basic"].some((x) => securityDomains.has(x)),
      [...securityDomains].join(",")
    );
    assertCondition(
      "HD-R2 safety boundary exists",
      String(security.body.data.prompt_brain_context || "").includes("現実の攻撃"),
      "missing safety boundary"
    );
  });

  console.log("============================================================");
  console.log(`PASS_COUNT=${passCount}`);
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
