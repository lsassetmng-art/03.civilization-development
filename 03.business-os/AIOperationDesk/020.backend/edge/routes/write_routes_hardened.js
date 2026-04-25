import { jsonResponse, readJsonSafe } from "../aiod_http_response.js";
import { handleWriteRoute } from "./write_routes.js";
import { buildRequestContext, assertContextForWrite } from "../../lib/aiod_request_context.js";
import { isHardeningEnabled } from "../../lib/aiod_hardening_policy.js";
import { attachPostWriteHooks } from "../../lib/aiod_hardening_post_write.js";

function errorResponse(code, message, details = {}, status = 403) {
  return jsonResponse(
    {
      ok: false,
      error: {
        code,
        message,
        details
      }
    },
    status
  );
}

export async function handleWriteRouteHardened(req, path, method) {
  const payload = await readJsonSafe(req);

  if (!isHardeningEnabled()) {
    return handleWriteRoute(
      new Request(req.url, {
        method,
        headers: req.headers,
        body: JSON.stringify(payload)
      }),
      path,
      method
    );
  }

  try {
    const ctx = buildRequestContext(req, payload);
    assertContextForWrite(ctx);

    const forwardedPayload = {
      ...payload,
      requester_user_id: payload.requester_user_id || ctx.actor.actor_id,
      reviewer_user_id: payload.reviewer_user_id || ctx.actor.actor_id,
      approver_user_id: payload.approver_user_id || ctx.actor.actor_id,
      actor_company_ref: payload.actor_company_ref || ctx.actor.company_ref || null
    };

    if (ctx.permission.review_required_override === true) {
      forwardedPayload.review_required_override = true;
    }

    if (ctx.permission.approval_required_override === true) {
      forwardedPayload.approval_required_override = true;
    }

    const response = await handleWriteRoute(
      new Request(req.url, {
        method,
        headers: req.headers,
        body: JSON.stringify(forwardedPayload)
      }),
      path,
      method
    );

    return attachPostWriteHooks(response, {
      path,
      method,
      actor: ctx.actor,
      permission: ctx.permission
    });
  } catch (e) {
    return errorResponse(
      "WRITE_GUARD_REJECTED",
      e?.message || "Write guard rejected request.",
      {
        path,
        method
      },
      403
    );
  }
}
