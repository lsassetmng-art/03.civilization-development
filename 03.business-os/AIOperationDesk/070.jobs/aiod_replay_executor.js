import { readEnv } from "../020.backend/lib/aiod_env.js";
import { fetchNotificationEventRetentionReview } from "../020.backend/lib/aiod_retention_review_psql.js";
import { summarizeReplayCandidates } from "../020.backend/lib/aiod_notification_replay_candidates.js";
import { dispatchLineProvider } from "../080.notifications/line_provider_contract.js";
import { buildReplayLiveEnvelope } from "./aiod_replay_live_guard.js";
import { buildReplayLiveEvidence, summarizeReplayLiveEvidence } from "./aiod_replay_live_evidence.js";
import {
  writeRuntimeEvidence,
  shouldWriteRuntimeEvidence
} from "../020.backend/lib/aiod_file_evidence_writer.js";

function replayMode() {
  return readEnv("AIOD_REPLAY_EXECUTION_MODE", "dry_run");
}

export async function runReplayExecutor() {
  const items = await fetchNotificationEventRetentionReview();
  const summary = summarizeReplayCandidates(items);

  if (replayMode() === "dry_run") {
    return {
      replay_mode: "dry_run",
      total_candidates: summary.total_candidates,
      candidates: summary.candidates
    };
  }

  const results = [];
  const evidence = [];

  for (const candidate of summary.candidates) {
    const envelope = buildReplayLiveEnvelope(candidate);

    const providerResult = await dispatchLineProvider({
      notification_event_id: envelope.notification_event_id,
      notification_type: envelope.notification_type,
      destination_type: "line",
      destination_ref: readEnv("AIOD_LINE_PROVIDER_TEST_DESTINATION", "line_stub_default"),
      title: envelope.notification_type || "notification",
      body: `replay for notification_event_id=${envelope.notification_event_id}`,
      payload: {
        work_order_id: envelope.work_order_id,
        replay_reason: envelope.replay_reason,
        live_allowed: envelope.live_allowed
      }
    });

    const replayEvidence = buildReplayLiveEvidence({
      notification_event_id: envelope.notification_event_id,
      work_order_id: envelope.work_order_id,
      notification_type: envelope.notification_type,
      replay_reason: envelope.replay_reason,
      provider_delivery_status: providerResult.delivery_status || null,
      provider_error_code: providerResult.provider_error_code || null
    });

    results.push({
      candidate: envelope,
      provider_result: providerResult,
      replay_evidence: replayEvidence
    });

    evidence.push(replayEvidence);
  }

  const replayEvidenceSummary = summarizeReplayLiveEvidence(evidence);
  let runtimeEvidenceFile = null;

  if (shouldWriteRuntimeEvidence()) {
    runtimeEvidenceFile = await writeRuntimeEvidence("replay_live", {
      replay_mode: "live",
      total_candidates: summary.total_candidates,
      replay_evidence_summary: replayEvidenceSummary,
      replay_evidence: evidence
    });
  }

  return {
    replay_mode: "live",
    total_candidates: summary.total_candidates,
    replay_results: results,
    replay_evidence_summary: replayEvidenceSummary,
    runtime_evidence_file: runtimeEvidenceFile
  };
}
