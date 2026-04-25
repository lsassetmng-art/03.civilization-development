import {
  handleExecutionRequest,
  handleReviewDecide,
  handleApprovalDecide,
  handleNotificationRuleSave
} from "../edge/aiod_handlers_stub.js";

import {
  createExecutionRequestPsql,
  decideReviewPsql,
  decideApprovalPsql,
  saveNotificationRulePsql
} from "./aiod_write_gateway_psql.js";

function mode() {
  return (globalThis.Deno?.env?.get?.("AIOD_DATA_MODE") || "mock").toLowerCase();
}

export async function createExecutionRequestGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await createExecutionRequestPsql(payload)
    };
  }
  return handleExecutionRequest(payload);
}

export async function decideReviewGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await decideReviewPsql(payload)
    };
  }
  return handleReviewDecide(payload);
}

export async function decideApprovalGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await decideApprovalPsql(payload)
    };
  }
  return handleApprovalDecide(payload);
}

export async function saveNotificationRuleGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await saveNotificationRulePsql(payload)
    };
  }
  return handleNotificationRuleSave(payload);
}
