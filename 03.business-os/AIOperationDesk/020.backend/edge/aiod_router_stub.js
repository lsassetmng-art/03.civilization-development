import {
  handleRequestIntake,
  handleSupportedAppExplain,
  handleErpProvisionalVoucher,
  handleExecutionRequest,
  handleReviewDecide,
  handleApprovalDecide,
  handleQueue,
  handleRetrySchedule,
  handleNotificationRuleSave
} from "./aiod_handlers_stub.js";
import {
  listSupportedApps,
  listFailures,
  listReviewInbox,
  listApprovalInbox,
  listSummaryBatches
} from "../lib/aiod_mock_store.js";
import { ok, ng } from "../lib/aiod_response.js";

export function routeStub(path, method, payload = {}) {
  if (method === "POST" && path === "/api/ai-operation-desk/requests") {
    return handleRequestIntake(payload);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/supported-app/explain") {
    return handleSupportedAppExplain(payload);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/erp/provisional-voucher") {
    return handleErpProvisionalVoucher(payload);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/execution-requests") {
    return handleExecutionRequest(payload);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/reviews/decide") {
    return handleReviewDecide(payload);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/approvals/decide") {
    return handleApprovalDecide(payload);
  }

  if (method === "GET" && path === "/api/ai-operation-desk/queue") {
    return handleQueue();
  }

  if (method === "GET" && path === "/api/ai-operation-desk/failures") {
    return ok({ items: listFailures() });
  }

  if (method === "GET" && path === "/api/ai-operation-desk/review-inbox") {
    return ok({ items: listReviewInbox() });
  }

  if (method === "GET" && path === "/api/ai-operation-desk/approval-inbox") {
    return ok({ items: listApprovalInbox() });
  }

  if (method === "GET" && path === "/api/ai-operation-desk/supported-apps") {
    return ok({ items: listSupportedApps() });
  }

  if (method === "GET" && path === "/api/ai-operation-desk/summary-batches") {
    return ok({ items: listSummaryBatches() });
  }

  if (method === "POST" && path === "/api/ai-operation-desk/retries/schedule") {
    return handleRetrySchedule(payload);
  }

  if (method === "PUT" && path === "/api/ai-operation-desk/notification-rules") {
    return handleNotificationRuleSave(payload);
  }

  return ng("ROUTE_NOT_FOUND", "Stub route not found.", { path, method });
}
