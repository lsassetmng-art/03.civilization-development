import { dispatchLineProvider } from "../../080.notifications/line_provider_contract.js";
import { readEnv } from "./aiod_env.js";
import { createRuntimeAuditStub } from "./aiod_runtime_audit_stub.js";
import { persistPostWriteDbArtifacts } from "./aiod_hardening_post_write_db.js";
import { processProviderDispatchResult } from "./aiod_provider_result_follow_on.js";

function resolveNotificationType(path, responseData = {}) {
  if (path === "/api/ai-operation-desk/execution-requests") {
    if (responseData.approval_required === true) {
      return "approval_pending";
    }
    if (responseData.review_required === true) {
      return "review_pending";
    }
    return null;
  }

  if (path === "/api/ai-operation-desk/retries/schedule") {
    return "retry_scheduled";
  }

  if (path === "/api/ai-operation-desk/notification-rules") {
    return null;
  }

  if (path === "/api/ai-operation-desk/erp/provisional-voucher") {
    return "review_pending";
  }

  return null;
}

async function parseJsonResponse(response) {
  const text = await response.clone().text();

  try {
    return JSON.parse(text);
  } catch (_e) {
    return null;
  }
}

function toResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
      "access-control-allow-headers": "content-type,x-aiod-actor-id,x-aiod-actor-type,x-aiod-company-ref"
    }
  });
}

function resolveWorkOrderId(data = {}) {
  return data.work_order_id || data.compiled_work_order_id || null;
}

function extractProviderEvidence(providerDispatch) {
  if (!providerDispatch) {
    return null;
  }

  return {
    runtime_evidence_file: providerDispatch.runtime_evidence_file || null,
    live_evidence: providerDispatch.live_evidence || null,
    execution_mode: providerDispatch.execution_mode || null
  };
}

export async function attachPostWriteHooks(response, ctx = {}) {
  const parsed = await parseJsonResponse(response);

  if (!parsed || parsed.ok !== true || !parsed.data) {
    return response;
  }

  const notificationType = resolveNotificationType(ctx.path, parsed.data);
  const workOrderId = resolveWorkOrderId(parsed.data);

  const runtimeAudit = createRuntimeAuditStub({
    event_type: "post_write_enriched",
    actor_id: ctx.actor?.actor_id || "unknown_actor",
    path: ctx.path,
    method: ctx.method,
    work_order_id: workOrderId,
    notification_type: notificationType
  });

  const persisted = await persistPostWriteDbArtifacts({
    work_order_id: workOrderId,
    notification_type: notificationType,
    destination_ref: readEnv("AIOD_LINE_PROVIDER_TEST_DESTINATION", "line_stub_default"),
    event_type: "post_write_runtime_audit",
    event_summary: "Post-write runtime audit persisted from hardening flow.",
    actor_type: ctx.actor?.actor_type || "user",
    actor_ref: ctx.actor?.actor_id || "unknown_actor"
  });

  let providerDispatch = null;
  let providerFollowOn = null;
  let providerEvidence = null;

  if (notificationType) {
    providerDispatch = await dispatchLineProvider({
      notification_event_id:
        persisted?.notification_event?.notification_event_id ||
        `runtime_stub_${Date.now()}`,
      notification_type: notificationType,
      destination_type: "line",
      destination_ref: readEnv("AIOD_LINE_PROVIDER_TEST_DESTINATION", "line_stub_default"),
      title: notificationType,
      body: "stub post-write dispatch",
      payload: {
        actor_id: ctx.actor?.actor_id || "unknown_actor",
        work_order_id: workOrderId,
        created_at: new Date().toISOString()
      }
    });

    providerFollowOn = await processProviderDispatchResult({
      provider_result: providerDispatch,
      notification_event: persisted?.notification_event || null
    });

    providerEvidence = extractProviderEvidence(providerDispatch);
  }

  return toResponse(
    {
      ...parsed,
      hardening: {
        actor: ctx.actor || null,
        permission: ctx.permission || null,
        runtime_audit: runtimeAudit,
        persisted_follow_on: persisted,
        provider_dispatch: providerDispatch,
        provider_follow_on: providerFollowOn,
        provider_evidence: providerEvidence
      }
    },
    response.status
  );
}
