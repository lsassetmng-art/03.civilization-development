const fs = require("fs");
const vm = require("vm");
const path = require("path");

const implRoot = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker";

global.window = global;

if (typeof structuredClone === "undefined") {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

const localStorageStore = {};
global.localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(localStorageStore, key) ? localStorageStore[key] : null;
  },
  setItem(key, value) {
    localStorageStore[key] = String(value);
  },
  removeItem(key) {
    delete localStorageStore[key];
  },
  clear() {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
  }
};

function load(relativePath) {
  const fullPath = path.join(implRoot, relativePath);
  const code = fs.readFileSync(fullPath, "utf8");
  vm.runInThisContext(code, { filename: fullPath });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  load("domain/constants.js");
  load("pricing/pricing-domain.js");
  load("ticket/free-ticket-domain.js");
  load("safety/safety-policy.js");
  load("aiworker-reference/mock-aiworker-reference.js");
  load("cx-reference/mock-cx-material.js");
  load("api-client/mock-business-api-client.js");

  assert(window.CCW_DOMAIN_CONSTANTS.priceUnitJpy === 500, "price unit must be 500 JPY");
  assert(window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket.grantedTicketCount === 2, "monthly ticket count must be 2");
  assert(window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket.minutesPerTicket === 30, "minutes per ticket must be 30");

  const quote30 = window.CCW_PRICING_DOMAIN.calculateQuote(30, 2, true);
  assert(quote30.finalPriceJpy === 0, "30 minutes with one ticket should be 0 JPY");
  assert(quote30.appliedFreeTicketCount === 1, "30 minutes should apply one ticket");

  const quote60 = window.CCW_PRICING_DOMAIN.calculateQuote(60, 2, true);
  assert(quote60.finalPriceJpy === 0, "60 minutes with two tickets should be 0 JPY");
  assert(quote60.appliedFreeTicketCount === 2, "60 minutes should apply two tickets");

  const quote90 = window.CCW_PRICING_DOMAIN.calculateQuote(90, 2, true);
  assert(quote90.finalPriceJpy === 500, "90 minutes with two tickets should be 500 JPY");
  assert(quote90.paidMinutes === 30, "90 minutes with two tickets should leave 30 paid minutes");

  const quote120 = window.CCW_PRICING_DOMAIN.calculateQuote(120, 2, true);
  assert(quote120.finalPriceJpy === 1000, "120 minutes with two tickets should be 1000 JPY");
  assert(quote120.paidMinutes === 60, "120 minutes with two tickets should leave 60 paid minutes");

  await window.CCW_BUSINESS_API_CLIENT.clearHistory();

  const balanceBefore = await window.CCW_BUSINESS_API_CLIENT.getFreeTicketBalance();
  assert(balanceBefore.remainingTicketCount === 2, "initial remaining tickets should be 2");

  const workers = await window.CCW_BUSINESS_API_CLIENT.listWorkers("all");
  assert(workers.length >= 4, "mock worker catalog should have at least 4 workers");

  const lover = await window.CCW_BUSINESS_API_CLIENT.getWorkerDetail("lover-ren");
  assert(lover.workerType === "Lover", "lover-ren must be Lover");

  const apiQuote90 = await window.CCW_BUSINESS_API_CLIENT.quoteContract({
    durationMinutes: 90,
    applyTickets: true
  });

  assert(apiQuote90.finalPriceJpy === 500, "API quote 90 should be 500 JPY");

  const contract = await window.CCW_BUSINESS_API_CLIENT.confirmContract({
    worker: lover,
    quote: apiQuote90
  });

  assert(contract.durationMinutes === 90, "contract duration should be 90");
  assert(contract.finalPriceJpy === 500, "contract final price should be 500");
  assert(contract.appliedFreeTicketCount === 2, "contract should consume two tickets");

  const balanceAfter = await window.CCW_BUSINESS_API_CLIENT.getFreeTicketBalance();
  assert(balanceAfter.remainingTicketCount === 0, "remaining tickets should be 0 after using two tickets");

  const history = await window.CCW_BUSINESS_API_CLIENT.getHistory();
  assert(history.length === 1, "history should contain one contract");

  await window.CCW_BUSINESS_API_CLIENT.updateContractEnded(contract.contractId);
  const endedHistory = await window.CCW_BUSINESS_API_CLIENT.getHistory();
  assert(endedHistory[0].status === "ended", "history contract should be ended");

  assert(window.CCW_SAFETY_POLICY.containsUnsafeKeyword("住所を教えて") === true, "unsafe keyword should be detected");
  assert(window.CCW_SAFETY_POLICY.containsUnsafeKeyword("今日は雑談したい") === false, "safe message should not be flagged");

  const loverRedirect = window.CCW_SAFETY_POLICY.getRedirect("Lover");
  assert(loverRedirect.includes("安心"), "Lover redirect should guide to safe talk");

  console.log("CasualChatWorker contract/session domain test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
