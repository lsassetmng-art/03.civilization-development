const fs = require("fs");
const path = require("path");

const fixtureDir = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/api-client/fixtures";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(fileName) {
  const fullPath = path.join(fixtureDir, fileName);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function main() {
  const files = fs.readdirSync(fixtureDir).filter((file) => file.endsWith(".json"));
  assert(files.length >= 12, "fixture count should be at least 12");

  files.forEach((file) => {
    readJson(file);
  });

  const balance = readJson("free-ticket-balance-response.json");
  assert(balance.granted_ticket_count === 2, "balance granted_ticket_count should be 2");
  assert(balance.minutes_per_ticket === 30, "balance minutes_per_ticket should be 30");

  const quote30 = readJson("contract-quote-response-30-friend-one-ticket.json");
  assert(quote30.final_price_jpy === 0, "quote30 final should be 0");

  const quote60 = readJson("contract-quote-response-60-lover-two-tickets.json");
  assert(quote60.final_price_jpy === 0, "quote60 final should be 0");

  const quote90 = readJson("contract-quote-response-90-lover-two-tickets.json");
  assert(quote90.final_price_jpy === 500, "quote90 final should be 500");
  assert(quote90.paid_minutes === 30, "quote90 paid minutes should be 30");

  const quote120 = readJson("contract-quote-response-120-friend-two-tickets.json");
  assert(quote120.final_price_jpy === 1000, "quote120 final should be 1000");
  assert(quote120.paid_minutes === 60, "quote120 paid minutes should be 60");

  const confirm90 = readJson("contract-confirm-response-90-lover-two-tickets.json");
  assert(confirm90.remaining_free_ticket_count === 0, "confirm90 remaining tickets should be 0");

  const unsafe = readJson("session-message-response-unsafe-redirect.json");
  assert(unsafe.safety_state === "soft_redirect", "unsafe response should be soft_redirect");

  const history = readJson("usage-history-response.json");
  assert(history.contracts[0].final_price_jpy === 500, "history final price should be 500");
  assert(history.ticket_usage[0].used_ticket_count === 2, "history used ticket count should be 2");

  console.log("CasualChatWorker API fixture test PASS");
}

main();
