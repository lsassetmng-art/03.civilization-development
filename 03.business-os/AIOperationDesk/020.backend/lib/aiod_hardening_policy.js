import { readEnv } from "./aiod_env.js";

export function getHardeningMode() {
  return readEnv("AIOD_HARDENING_MODE", "off");
}

export function isHardeningEnabled() {
  return getHardeningMode() === "enforced";
}

export function isWritePath(path, method) {
  const m = String(method || "").toUpperCase();
  return (
    (m === "POST" && path === "/api/ai-operation-desk/requests") ||
    (m === "POST" && path === "/api/ai-operation-desk/erp/provisional-voucher") ||
    (m === "POST" && path === "/api/ai-operation-desk/execution-requests") ||
    (m === "POST" && path === "/api/ai-operation-desk/reviews/decide") ||
    (m === "POST" && path === "/api/ai-operation-desk/approvals/decide") ||
    (m === "POST" && path === "/api/ai-operation-desk/retries/schedule") ||
    (m === "PUT"  && path === "/api/ai-operation-desk/notification-rules")
  );
}
