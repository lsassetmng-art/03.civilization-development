import { requireSecret, hasSecret } from "../020.backend/lib/aiod_secret_contract.js";
import { readEnv } from "../020.backend/lib/aiod_env.js";
import { buildSafeProviderMeta } from "../020.backend/lib/aiod_safe_log.js";
import { buildLinePushPayload } from "./line_provider_http_payload_builder.js";
import { normalizeLineHttpResponse } from "./line_provider_http_response_normalizer.js";
import { buildProviderLiveEvidence } from "./line_provider_live_evidence.js";
import {
  writeRuntimeEvidence,
  shouldWriteRuntimeEvidence
} from "../020.backend/lib/aiod_file_evidence_writer.js";

function providerExecutionMode() {
  return readEnv("AIOD_LINE_HTTP_EXECUTION_MODE", "dry_run");
}

function requireEndpoint() {
  const endpoint = readEnv("AIOD_LINE_PUSH_ENDPOINT", "");
  if (!endpoint) {
    throw new Error("AIOD_LINE_PUSH_ENDPOINT is required for line_http mode.");
  }
  return endpoint;
}

async function attachEvidence(prefix, baseResult, evidencePayload) {
  if (!shouldWriteRuntimeEvidence()) {
    return {
      ...baseResult,
      runtime_evidence_file: null
    };
  }

  const runtimeEvidenceFile = await writeRuntimeEvidence(prefix, evidencePayload);

  return {
    ...baseResult,
    runtime_evidence_file: runtimeEvidenceFile
  };
}

function buildDryRunBase(eventPayload = {}) {
  const endpoint = readEnv("AIOD_LINE_PUSH_ENDPOINT", "");
  const tokenPresent = hasSecret("AIOD_LINE_CHANNEL_ACCESS_TOKEN");

  return {
    provider_mode: "line_http",
    delivery_status: "cancelled",
    provider_message_ref: null,
    provider_error_code: "DRY_RUN",
    provider_error_summary: "Provider http dry-run mode. No outbound request sent.",
    safe_meta: buildSafeProviderMeta({
      provider_mode: "line_http",
      endpoint,
      destination_type: eventPayload.destination_type || "line",
      destination_ref: eventPayload.destination_ref || null,
      title: eventPayload.title || null,
      body: eventPayload.body || null
    }),
    execution_mode: "dry_run",
    env_readiness: {
      endpoint_present: !!endpoint,
      access_token_present: tokenPresent
    }
  };
}

export async function dispatchLineHttpImpl(eventPayload = {}) {
  const executionMode = providerExecutionMode();

  if (executionMode !== "live") {
    const base = buildDryRunBase(eventPayload);

    const liveEvidence = buildProviderLiveEvidence({
      notification_event_id: eventPayload.notification_event_id || null,
      provider_mode: base.provider_mode,
      execution_mode: base.execution_mode,
      delivery_status: base.delivery_status,
      provider_error_code: base.provider_error_code,
      provider_error_summary: base.provider_error_summary,
      safe_meta: base.safe_meta
    });

    return attachEvidence("provider_live", {
      ...base,
      live_evidence: liveEvidence
    }, liveEvidence);
  }

  const endpoint = requireEndpoint();
  const accessToken = requireSecret("AIOD_LINE_CHANNEL_ACCESS_TOKEN");
  const payload = buildLinePushPayload(eventPayload);

  const safeMeta = buildSafeProviderMeta({
    provider_mode: "line_http",
    endpoint,
    destination_type: eventPayload.destination_type || "line",
    destination_ref: eventPayload.destination_ref || null,
    title: eventPayload.title || null,
    body: eventPayload.body || null
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const normalized = await normalizeLineHttpResponse(response);

    const liveEvidence = buildProviderLiveEvidence({
      notification_event_id: eventPayload.notification_event_id || null,
      provider_mode: normalized.provider_mode,
      execution_mode: "live",
      delivery_status: normalized.delivery_status,
      provider_error_code: normalized.provider_error_code,
      provider_error_summary: normalized.provider_error_summary,
      safe_meta: safeMeta
    });

    return attachEvidence("provider_live", {
      ...normalized,
      safe_meta: safeMeta,
      execution_mode: "live",
      live_evidence: liveEvidence
    }, liveEvidence);
  } catch (e) {
    const failed = {
      provider_mode: "line_http",
      delivery_status: "failed",
      provider_message_ref: null,
      provider_error_code: "HTTP_FETCH_ERROR",
      provider_error_summary: e?.message || String(e),
      safe_meta: safeMeta,
      execution_mode: "live"
    };

    const liveEvidence = buildProviderLiveEvidence({
      notification_event_id: eventPayload.notification_event_id || null,
      provider_mode: failed.provider_mode,
      execution_mode: failed.execution_mode,
      delivery_status: failed.delivery_status,
      provider_error_code: failed.provider_error_code,
      provider_error_summary: failed.provider_error_summary,
      safe_meta: safeMeta
    });

    return attachEvidence("provider_live", {
      ...failed,
      live_evidence: liveEvidence
    }, liveEvidence);
  }
}
