function apiError(payload, status) {
  const error = new Error(
    payload?.errorMessage ||
    payload?.message ||
    `GameOS Builder API request failed (${status})`
  );

  error.status = status;
  error.payload = payload;
  return error;
}

async function parseJson(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw apiError(
      {
        errorCode: "GAME_BUILDER_INVALID_JSON_RESPONSE",
        errorMessage: "Builder API returned invalid JSON.",
        errorState: "failed",
        retryAllowed: false
      },
      response.status
    );
  }
}

export class BuilderApiClient {
  constructor({
    fetchImpl = globalThis.fetch,
    endpoint = "/game/builder/projects"
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("fetch implementation is required");
    }

    this.fetchImpl = fetchImpl;
    this.endpoint = endpoint;
  }

  async request(url, options = {}) {
    const response = await this.fetchImpl(url, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await parseJson(response);

    if (!response.ok || payload?.errorCode) {
      throw apiError(payload, response.status);
    }

    return payload;
  }

  loadBootstrap() {
    return this.request(`${this.endpoint}?mode=bootstrap`);
  }

  getProject(projectCode) {
    return this.request(
      `${this.endpoint}?projectCode=${encodeURIComponent(projectCode)}`
    );
  }

  createProject(payload) {
    return this.request(this.endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
}
