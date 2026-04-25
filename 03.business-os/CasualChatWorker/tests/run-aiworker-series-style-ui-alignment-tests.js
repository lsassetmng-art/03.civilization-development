const fs = require("fs");
const vm = require("vm");
const path = require("path");

const implRoot = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker";

global.window = global;

function load(relativePath) {
  const fullPath = path.join(implRoot, relativePath);
  const code = fs.readFileSync(fullPath, "utf8");
  vm.runInThisContext(code, { filename: fullPath });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  load("aiworker-reference/series-tendency-reference.js");
  load("aiworker-reference/lovers-style-selection-cards.js");
  load("aiworker-reference/mock-aiworker-reference.js");
  load("pricing/pricing-domain.js");
  load("components/ui-renderers.js");

  const haruka = window.CCW_AIWORKER_REFERENCE.find("friend-haruka");
  const ren = window.CCW_AIWORKER_REFERENCE.find("lover-ren");
  const mio = window.CCW_AIWORKER_REFERENCE.find("lover-mio");

  const harukaCard = window.CCW_UI_RENDERERS.workerCard(haruka);
  const renCard = window.CCW_UI_RENDERERS.workerCard(ren);
  const mioCard = window.CCW_UI_RENDERERS.workerCard(mio);

  assert(harukaCard.includes("HDシリーズ"), "Friend card should show HD series");
  assert(harukaCard.includes("積極性"), "Friend card should show tendency axes");

  assert(renCard.includes("LoVerSシリーズ"), "Lover card should show LoVerS series");
  assert(renCard.includes("癒やし系"), "Ren card should show style name");

  assert(mioCard.includes("ビジネスヤンデレ"), "Mio card should show Business Yandere style");
  assert(mioCard.includes("強安全注意"), "Mio card should show strong safety badge");
  assert(mioCard.includes("監視・脅し・依存誘導"), "Mio card should show strong safety text");

  const detail = window.CCW_UI_RENDERERS.selectedWorkerDetail(mio);
  assert(detail.includes("ビジネスヤンデレ"), "Selected detail should show style");
  assert(detail.includes("安全境界強"), "Selected detail should show tags");

  console.log("CasualChatWorker AIWorker series/style UI alignment test PASS");
}

main();
