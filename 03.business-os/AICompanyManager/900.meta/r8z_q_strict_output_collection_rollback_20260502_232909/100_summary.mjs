import fs from "fs";

const data = JSON.parse(fs.readFileSync(process.env.COLLECT_JSON, "utf8"));
const collectable = Number(data.collectable_count || 0);
const notReady = Number(data.not_ready_count || 0);

let finalJudgement = data.final_judgement || "UNKNOWN";
let nextAction = "";

if (finalJudgement === "COLLECTABLE_OUTPUT_FOUND_ROLLBACK_DB_UPDATE_READY") {
  nextAction = "佐藤レビュー後、R8Z-Rで永続反映する。";
} else {
  nextAction = "AIWorkerOS側の成果物生成/delivery完了処理を見る。AICM側DB反映はまだしない。";
}

const summary = {
  result: data.result,
  request_row_count: data.request_row_count || 0,
  collectable_count: collectable,
  not_ready_count: notReady,
  final_judgement: finalJudgement,
  next_action: nextAction,
  row_summary: data.rows.map((x) => ({
    aicm_worker_work_unit_id: x.aicm_worker_work_unit_id,
    work_unit_name: x.work_unit_name,
    request_id: x.request_id,
    collectable: x.collectable,
    collect_reason: x.collect_reason,
    result_summary_preview: String(x.result_summary_text || "").slice(0, 220),
    endpoint_summary: x.endpoint_summary,
    text_candidate_count: x.signals.text_candidates.length,
    title_candidate_count: x.signals.title_candidates.length,
    link_candidate_count: x.signals.link_candidates.length,
    status_candidate_count: x.signals.status_candidates.length
  }))
};

console.log(JSON.stringify(summary, null, 2));
console.log("REQUEST_ROW_COUNT=" + summary.request_row_count);
console.log("COLLECTABLE_COUNT=" + summary.collectable_count);
console.log("NOT_READY_COUNT=" + summary.not_ready_count);
console.log("FINAL_JUDGEMENT=" + summary.final_judgement);
console.log("NEXT_ACTION=" + summary.next_action);
