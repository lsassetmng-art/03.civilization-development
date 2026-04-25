function apiBase() {
  if (window.AIOD_API_BASE && typeof window.AIOD_API_BASE === "string") {
    return window.AIOD_API_BASE.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8787/api/ai-operation-desk";
}

async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (_e) {
    return {
      ok: false,
      error: {
        code: "INVALID_JSON",
        message: "Response was not valid JSON.",
        details: { raw: text }
      }
    };
  }
}

async function request(path, method = "GET", payload = null) {
  const opts = {
    method,
    headers: {
      "content-type": "application/json"
    }
  };

  if (payload !== null) {
    opts.body = JSON.stringify(payload);
  }

  const res = await fetch(`${apiBase()}${path}`, opts);
  return readJson(res);
}

export const aiodApi = {
  health() {
    return request("/health", "GET");
  },
  supportedApps() {
    return request("/supported-apps", "GET");
  },
  queue() {
    return request("/queue", "GET");
  },
  failures() {
    return request("/failures", "GET");
  },
  reviewInbox() {
    return request("/review-inbox", "GET");
  },
  approvalInbox() {
    return request("/approval-inbox", "GET");
  },
  summaryBatches() {
    return request("/summary-batches", "GET");
  },
  compileRequest(payload) {
    return request("/requests", "POST", payload);
  },
  explainSupportedApp(payload) {
    return request("/supported-app/explain", "POST", payload);
  },
  provisionalVoucher(payload) {
    return request("/erp/provisional-voucher", "POST", payload);
  },
  executionRequest(payload) {
    return request("/execution-requests", "POST", payload);
  },
  reviewDecide(payload) {
    return request("/reviews/decide", "POST", payload);
  },
  approvalDecide(payload) {
    return request("/approvals/decide", "POST", payload);
  },
  retrySchedule(payload) {
    return request("/retries/schedule", "POST", payload);
  },
  saveNotificationRules(payload) {
    return request("/notification-rules", "PUT", payload);
  }
};
