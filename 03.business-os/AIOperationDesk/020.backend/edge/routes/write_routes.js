import { jsonResponse, readJsonSafe } from "../aiod_http_response.js";
import { routeStub } from "../aiod_router_stub.js";
import {
  createExecutionRequestGateway,
  decideReviewGateway,
  decideApprovalGateway,
  saveNotificationRuleGateway
} from "../../lib/aiod_write_gateway.js";
import {
  createOperationRequestGateway,
  createProvisionalVoucherGateway,
  scheduleRetryGateway
} from "../../lib/aiod_request_gateway.js";

export async function handleWriteRoute(req, path, method) {
  const payload = await readJsonSafe(req);

  if (method === "POST" && path === "/api/ai-operation-desk/requests") {
    const result = await createOperationRequestGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/erp/provisional-voucher") {
    const result = await createProvisionalVoucherGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/retries/schedule") {
    const result = await scheduleRetryGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/execution-requests") {
    const result = await createExecutionRequestGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/reviews/decide") {
    const result = await decideReviewGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/approvals/decide") {
    const result = await decideApprovalGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "PUT" && path === "/api/ai-operation-desk/notification-rules") {
    const result = await saveNotificationRuleGateway(payload);
    const status = result.ok ? 200 : 400;
    return jsonResponse(result, status);
  }

  if (method === "POST" && path === "/api/ai-operation-desk/supported-app/explain") {
    const routed = routeStub(path, method, payload);
    const status = routed.ok ? 200 : 400;
    return jsonResponse(routed, status);
  }

  return null;
}
