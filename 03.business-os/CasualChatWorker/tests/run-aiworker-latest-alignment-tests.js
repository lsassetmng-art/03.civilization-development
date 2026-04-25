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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(implRoot, relativePath), "utf8"));
}

function main() {
  load("aiworker-reference/series-tendency-reference.js");
  load("aiworker-reference/lovers-style-selection-cards.js");
  load("aiworker-reference/mock-aiworker-reference.js");

  const hd = window.CCW_AIWORKER_SERIES_TENDENCY_REFERENCE.get("hd_series");
  assert(hd.initiative === "medium", "HD initiative must be medium");
  assert(hd.userInfluence === "none", "HD user influence must be none");
  assert(hd.actionRestriction === "strict_policy", "HD action restriction must be strict_policy");

  const lovers = window.CCW_AIWORKER_SERIES_TENDENCY_REFERENCE.get("lovers_series");
  assert(lovers.initiative === "per_model", "LoVerS initiative must be per_model");
  assert(lovers.userInfluence === "soft", "LoVerS user influence must be soft");
  assert(lovers.actionRestriction === "strict_policy", "LoVerS action restriction must be strict_policy");

  const style12 = window.CCW_LOVERS_STYLE_SELECTION_CARDS.findByStyleNo("12");
  assert(style12.app_display_name_ja === "ビジネスヤンデレ", "style 12 must be Business Yandere");
  assert(style12.requires_strong_safety_notice_flag === true, "Business Yandere must require strong safety notice");

  const mio = window.CCW_AIWORKER_REFERENCE.find("lover-mio");
  assert(mio.seriesTendency.seriesCode === "lovers_series", "lover-mio must use LoVerS tendency");
  assert(mio.loversStyleCard.style_no_text === "12", "lover-mio must use style 12");
  assert(mio.loversStyleCard.requires_strong_safety_notice_flag === true, "lover-mio must require strong notice");

  const seriesFixture = readJson("api-client/fixtures/aiworker-series-tendency-summary-response.json");
  assert(seriesFixture.source_view === "aiworker.vw_series_tendency_summary_v1", "series fixture source mismatch");

  const styleFixture = readJson("api-client/fixtures/aiworker-lovers-style-selection-card-response.json");
  assert(styleFixture.source_view === "aiworker.vw_app_lovers_style_selection_card_v1", "style fixture source mismatch");

  console.log("CasualChatWorker AIWorker latest alignment test PASS");
}

main();
