import fs from "fs";

const data = JSON.parse(fs.readFileSync(process.env.COLLECT_JSON, "utf8"));
const rollbackLog = fs.existsSync(process.env.ROLLBACK_LOG) ? fs.readFileSync(process.env.ROLLBACK_LOG, "utf8") : "";
const verifyLog = fs.existsSync(process.env.VERIFY_LOG) ? fs.readFileSync(process.env.VERIFY_LOG, "utf8") : "";

const collectable = Number(data.collectable_count || 0);
const notReady = Number(data.not_ready_count || 0);

const rollbackUpdated =
  rollbackLog.includes("rollback_updated_rows") &&
  !rollbackLog.includes("ERROR:");

const rollbackPreserved =
  verifyLog.includes("verify_output_collection_mark_count") &&
  !verifyLog.includes(" r8z_s");

let finalJudgement = data.final_judgement || "UNKNOWN";
let nextAction = "";

if (collectable > 0 && rollbackUpdated) {
  finalJudgement = "DB_SOURCE_COLLECTOR_ROLLBACK_PASS_READY_FOR_PERSISTENT_REVIEW";
  nextAction = "佐藤レビュー後、R8Z-Tで永続反映する。";
} else if (collectable > 0 && !rollbackUpdated) {
  finalJudgement = "DB_SOURCE_COLLECTOR_FOUND_BUT_ROLLBACK_FAILED";
  nextAction = "rollback logを確認してSQL修正。";
} else {
  finalJudgement = "NO_DB_SOURCE_COLLECTABLE_OUTPUT";
  nextAction = "AIWorkerOS側のhandoff/output生成を再確認。";
}

const summary = {
  result: "ok",
  worker_row_count: data.worker_row_count || 0,
  collectable_count: collectable,
  not_ready_count: notReady,
  rollback_updated: rollbackUpdated,
  rollback_preserved_db: rollbackPreserved,
  final_judgement: finalJudgement,
  next_action: nextAction,
  row_summary: data.rows.map((x) => ({
    aicm_worker_work_unit_id: x.aicm_worker_work_unit_id,
    work_unit_name: x.work_unit_name,
    request_id: x.request_id,
    collectable: x.collectable,
    collect_reason: x.collect_reason,
    candidate_count: x.candidate_count,
    source_counts: x.source_counts,
    best_candidate: x.best_candidate,
    result_summary_preview: String(x.result_summary_text || "").slice(0, 260)
  }))
};

fs.writeFileSync(process.env.FINAL_ENV, [
  "WORKER_ROW_COUNT=" + summary.worker_row_count,
  "COLLECTABLE_COUNT=" + summary.collectable_count,
  "NOT_READY_COUNT=" + summary.not_ready_count,
  "ROLLBACK_UPDATED=" + (summary.rollback_updated ? "YES" : "NO"),
  "ROLLBACK_PRESERVED_DB=" + (summary.rollback_preserved_db ? "YES" : "NO"),
  "FINAL_JUDGEMENT=" + summary.final_judgement,
  "NEXT_ACTION=" + summary.next_action,
  "DB_WRITE=ROLLBACK_ONLY",
  "API_POST=NO",
  "PERSISTENT_DB_WRITE=NO",
  "PHYSICAL_DELETE=NO",
  "SATO_REVIEW=REQUIRED_BEFORE_PERSISTENT_APPLY"
].join("\n") + "\n");

console.log(JSON.stringify(summary, null, 2));
console.log("WORKER_ROW_COUNT=" + summary.worker_row_count);
console.log("COLLECTABLE_COUNT=" + summary.collectable_count);
console.log("NOT_READY_COUNT=" + summary.not_ready_count);
console.log("ROLLBACK_UPDATED=" + (summary.rollback_updated ? "YES" : "NO"));
console.log("ROLLBACK_PRESERVED_DB=" + (summary.rollback_preserved_db ? "YES" : "NO"));
console.log("FINAL_JUDGEMENT=" + summary.final_judgement);
console.log("NEXT_ACTION=" + summary.next_action);
