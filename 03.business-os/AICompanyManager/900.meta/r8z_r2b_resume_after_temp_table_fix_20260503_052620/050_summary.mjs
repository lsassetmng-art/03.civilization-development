import fs from "fs";

const serverScan = JSON.parse(fs.readFileSync(process.env.SERVER_SCAN_JSON, "utf8"));
const fetchScan = JSON.parse(fs.readFileSync(process.env.FETCH_JSON, "utf8"));
const requestHitText = fs.readFileSync(process.env.REQUEST_HIT_LOG, "utf8");

const hasOutputRoute = (serverScan.route_hits["runtime-execution/output"] || []).length > 0;
const hasResultRoute = (serverScan.route_hits["runtime-execution/result"] || []).length > 0;
const hasDeliveryRoute = (serverScan.route_hits["runtime-execution/delivery"] || []).length > 0;
const tableRefs = serverScan.sql_table_refs || [];

const requestHitExistsOutsideBusinessWorker =
  requestHitText.includes("request_id_hits") &&
  /aiworker\s+\|/.test(requestHitText);

const nonEmptyOutput = Number(fetchScan.total_non_empty_output_value_count || 0);
const nullOutput = Number(fetchScan.total_null_output_key_count || 0);

let finalJudgement = "UNKNOWN";
let recommendedNext = "";

if (nonEmptyOutput > 0) {
  finalJudgement = "OUTPUT_EXISTS_BUT_AICM_COLLECTOR_MISSED";
  recommendedNext = "AICM collectorの抽出キーを修正する。";
} else if (!hasOutputRoute && !hasResultRoute && hasDeliveryRoute) {
  finalJudgement = "AIWORKEROS_HAS_DELIVERY_ONLY_NO_OUTPUT_RESULT_ROUTE";
  recommendedNext = "deliveryレスポンスの実体生成を確認し、必要ならAIWorkerOS側にoutput本文生成を追加する。";
} else if (!requestHitExistsOutsideBusinessWorker) {
  finalJudgement = "AIWORKEROS_REQUEST_ACCEPTED_BUT_NO_PERSISTED_OUTPUT_BODY_FOUND";
  recommendedNext = "AIWorkerOS runtime request受付後の成果物生成/保存処理を追加または接続する。";
} else if (nullOutput > 0) {
  finalJudgement = "AIWORKEROS_OUTPUT_FIELDS_EXIST_BUT_EMPTY";
  recommendedNext = "AIWorkerOS側でoutput/delivery null項目を埋める生成処理を見る。";
} else {
  finalJudgement = "AIWORKEROS_OUTPUT_GENERATION_PATH_NEEDS_REVIEW";
  recommendedNext = "server snippetsとDB hitを見て生成責務を確定する。";
}

const summary = {
  result: "ok",
  has_output_route: hasOutputRoute,
  has_result_route: hasResultRoute,
  has_delivery_route: hasDeliveryRoute,
  sql_table_refs: tableRefs,
  request_hit_exists_outside_business_worker: requestHitExistsOutsideBusinessWorker,
  total_non_empty_output_value_count: nonEmptyOutput,
  total_null_output_key_count: nullOutput,
  fetch_final_hint: fetchScan.final_hint,
  final_judgement: finalJudgement,
  recommended_next: recommendedNext
};

console.log(JSON.stringify(summary, null, 2));
console.log("HAS_OUTPUT_ROUTE=" + (hasOutputRoute ? "YES" : "NO"));
console.log("HAS_RESULT_ROUTE=" + (hasResultRoute ? "YES" : "NO"));
console.log("HAS_DELIVERY_ROUTE=" + (hasDeliveryRoute ? "YES" : "NO"));
console.log("REQUEST_HIT_OUTSIDE_BUSINESS_WORKER=" + (requestHitExistsOutsideBusinessWorker ? "YES" : "NO"));
console.log("TOTAL_NON_EMPTY_OUTPUT_VALUE_COUNT=" + nonEmptyOutput);
console.log("TOTAL_NULL_OUTPUT_KEY_COUNT=" + nullOutput);
console.log("FINAL_JUDGEMENT=" + finalJudgement);
console.log("RECOMMENDED_NEXT=" + recommendedNext);
