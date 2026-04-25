const fs = require("fs");
const path = require("path");

const implRoot = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker";

const requiredFiles = [
  "backend/worker-rental-api/runtime/backend-runtime-config.js",
  "backend/worker-rental-api/server/local-in-memory-worker-rental-server.js",
  "backend/worker-rental-api/repositories/postgres-worker-rental-repository.js",
  "backend/worker-rental-api/server/worker-rental-http-router.js",
  "backend/worker-rental-api/payload-gap/payload-gap-checker.js",
  "backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js",
  "backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh",
  "backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(implRoot, relativePath), "utf8");
}

function scanNoFrontendSecrets() {
  const frontendDirs = [
    "app",
    "domain",
    "api-client",
    "components",
    "screens"
  ];

  const forbidden = [
    "DATABASE_URL=",
    "PERSONA_DATABASE_URL=",
    "service_role",
    "supabase_key",
    "psql "
  ];

  for (const dir of frontendDirs) {
    const fullDir = path.join(implRoot, dir);
    if (!fs.existsSync(fullDir)) continue;

    const stack = [fullDir];
    while (stack.length) {
      const current = stack.pop();
      const stat = fs.statSync(current);
      if (stat.isDirectory()) {
        for (const child of fs.readdirSync(current)) {
          stack.push(path.join(current, child));
        }
      } else {
        const text = fs.readFileSync(current, "utf8");
        for (const term of forbidden) {
          assert(!text.includes(term), `Forbidden frontend term ${term} in ${current}`);
        }
      }
    }
  }
}

function main() {
  for (const file of requiredFiles) {
    assert(fs.existsSync(path.join(implRoot, file)), `Missing required file: ${file}`);
  }

  const dryRunWrapper = read("backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh");
  assert(dryRunWrapper.includes("CCW_APPROVE_NONPROD_DB_DRY_RUN"), "dry-run wrapper missing approval flag");
  assert(dryRunWrapper.includes("ROLLBACK DONE"), "dry-run wrapper must check rollback");

  const liveGap = read("backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js");
  assert(liveGap.includes("CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK"), "live gap runner missing approval flag");
  assert(liveGap.includes("CCW_ALLOW_LIVE_CONFIRM_TEST"), "live confirm must be separately gated");

  scanNoFrontendSecrets();

  console.log("REAL MODE PREFLIGHT PASS");
}

main();
