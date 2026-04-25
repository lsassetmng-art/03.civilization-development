import { jsonResponse } from "../aiod_http_response.js";
import {
  fetchSupportedAppsGateway,
  fetchQueueGateway,
  fetchFailuresGateway,
  fetchReviewInboxGateway,
  fetchApprovalInboxGateway,
  fetchSummaryBatchesGateway
} from "../../lib/aiod_db_gateway.js";

export async function handleReadRoute(path) {
  if (path === "/api/ai-operation-desk/supported-apps") {
    return jsonResponse({ ok: true, data: await fetchSupportedAppsGateway() });
  }

  if (path === "/api/ai-operation-desk/queue") {
    return jsonResponse({ ok: true, data: await fetchQueueGateway() });
  }

  if (path === "/api/ai-operation-desk/failures") {
    return jsonResponse({ ok: true, data: await fetchFailuresGateway() });
  }

  if (path === "/api/ai-operation-desk/review-inbox") {
    return jsonResponse({ ok: true, data: await fetchReviewInboxGateway() });
  }

  if (path === "/api/ai-operation-desk/approval-inbox") {
    return jsonResponse({ ok: true, data: await fetchApprovalInboxGateway() });
  }

  if (path === "/api/ai-operation-desk/summary-batches") {
    return jsonResponse({ ok: true, data: await fetchSummaryBatchesGateway() });
  }

  return null;
}
