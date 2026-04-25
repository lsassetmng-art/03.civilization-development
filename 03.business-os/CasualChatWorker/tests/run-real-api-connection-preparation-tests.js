const fs = require("fs");
const vm = require("vm");
const path = require("path");

const implRoot = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker";

global.window = global;

const storage = {};
global.localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
  },
  setItem(key, value) {
    storage[key] = String(value);
  }
};

function load(relativePath) {
  const fullPath = path.join(implRoot, relativePath);
  const code = fs.readFileSync(fullPath, "utf8");
  vm.runInThisContext(code, { filename: fullPath });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  load("domain/constants.js");
  load("domain/runtime-config.js");
  load("pricing/pricing-domain.js");
  load("ticket/free-ticket-domain.js");
  load("domain/worker-rental-mapping.js");
  load("aiworker-reference/series-tendency-reference.js");
  load("aiworker-reference/lovers-style-selection-cards.js");
  load("aiworker-reference/mock-aiworker-reference.js");
  load("api-client/mock-business-api-client.js");
  load("api-client/worker-rental-payload-client.js");
  load("api-client/real-worker-rental-api-adapter.js");
  load("repository/worker-rental-repository.js");
  load("service/contract-service.js");

  assert(window.CCW_RUNTIME_CONFIG.apiMode === "mock", "default apiMode must be mock");
  assert(window.CCW_RUNTIME_CONFIG.canUseRealApi() === false, "real API must be disabled by default");

  const mode = window.CCW_WORKER_RENTAL_REPOSITORY.getMode();
  assert(mode === "mock", "repository should default to mock mode");

  const worker = window.CCW_AIWORKER_REFERENCE.find("lover-ren");
  const quote = await window.CCW_CONTRACT_SERVICE.quoteSelectedWorker(worker, 90);

  assert(quote.app_code === "CasualChatWorker", "quote app_code mismatch");
  assert(quote.service_code === "casual_chat_worker", "quote service_code mismatch");
  assert(quote.rental_unit_kind === "minute", "quote unit mismatch");
  assert(quote.rental_unit_count === 90, "quote duration mismatch");
  assert(quote.final_price_jpy === 500, "quote final price mismatch");

  const confirm = await window.CCW_CONTRACT_SERVICE.confirmSelectedWorker(worker, quote);
  assert(confirm.app_code === "CasualChatWorker", "confirm app_code mismatch");
  assert(confirm.service_code === "casual_chat_worker", "confirm service_code mismatch");
  assert(confirm.rental_unit_count === 90, "confirm duration mismatch");
  assert(confirm.final_price_jpy === 500, "confirm final price mismatch");

  const contract = JSON.parse(fs.readFileSync(path.join(implRoot, "api-client/contracts/worker-rental-payload-contract.json"), "utf8"));
  assert(contract.casual_chat_worker_rules.app_max_contract_minutes === 120, "contract max minutes mismatch");
  assert(contract.casual_chat_worker_rules.one_ticket_free_minutes === 30, "contract free ticket minutes mismatch");

  console.log("CasualChatWorker real API preparation test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
