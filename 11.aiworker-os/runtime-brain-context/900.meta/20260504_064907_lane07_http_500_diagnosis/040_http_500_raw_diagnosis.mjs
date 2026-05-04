import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";

const serverFile = process.env.SERVER_FILE;
const outFile = process.env.HTTP_RAW_OUT;
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";

if (!serverFile) throw new Error("SERVER_FILE env required");

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
  for (let i = 0; i < 50; i += 1) {
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

function requestRaw(port, path) {
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
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

try {
  const port = await waitForPort();
  console.log(`DETECTED_PORT=${port}`);

  const paths = [
    "/aiworker/v1/runtime-execution/endpoint-ready",
    "/aiworker/v1/runtime-execution/brain-context?model_code=BYD2-003&use_purpose_code=review&purpose_code=review&domains=history_worldview%2Ccivilization_foundation_history%2Ceducation_learning%2Cexam_learning&limit_per_domain=20&total_limit=80",
    "/aiworker/v1/runtime-execution/brain-context?model_code=HD-R5P&use_purpose_code=executive_planning&purpose_code=executive_planning&domains=business_operation%2Ccivilization_foundation_history%2Crobot_aiworker&limit_per_domain=20&total_limit=80",
  ];

  let raw = "";

  for (const path of paths) {
    const response = await requestRaw(port, path);
    raw += `\n============================================================\n`;
    raw += `PATH=${path}\n`;
    raw += `STATUS=${response.statusCode}\n`;
    raw += `HEADERS=${JSON.stringify(response.headers)}\n`;
    raw += `BODY_BEGIN\n${response.body}\nBODY_END\n`;

    console.log("============================================================");
    console.log(`PATH=${path}`);
    console.log(`STATUS=${response.statusCode}`);
    console.log("BODY_BEGIN");
    console.log(response.body);
    console.log("BODY_END");
  }

  raw += `\n============================================================\nSERVER_OUTPUT_BEGIN\n${serverOutput}\nSERVER_OUTPUT_END\n`;
  if (outFile) fs.writeFileSync(outFile, raw, "utf8");
} finally {
  server.kill("SIGTERM");
  await sleep(250);
  console.log("============================================================");
  console.log("SERVER_OUTPUT_BEGIN");
  console.log(serverOutput.trim());
  console.log("SERVER_OUTPUT_END");
}
