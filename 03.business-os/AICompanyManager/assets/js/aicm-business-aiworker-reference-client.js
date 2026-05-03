(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerReferenceClient = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  function getApiConfigClient() {
    return root && root.AICMBusinessAIWorkerApiConfigClient
      ? root.AICMBusinessAIWorkerApiConfigClient
      : null;
  }

  function buildQuery(params) {
    var pairs = [];

    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value === null || value === undefined || value === "") return;
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
    });

    return pairs.length ? "?" + pairs.join("&") : "";
  }

  function fallbackBaseUrl() {
    if (root && root.AICM_BUSINESS_AIWORKER_API_BASE_URL) {
      return String(root.AICM_BUSINESS_AIWORKER_API_BASE_URL).replace(/\/+$/, "");
    }

    return "http://127.0.0.1:8801";
  }

  function fallbackBuildUrl(path, params) {
    var p = String(path || "/");
    if (p.charAt(0) !== "/") p = "/" + p;
    return fallbackBaseUrl() + p + buildQuery(params || {});
  }

  function fallbackHeaders(headers) {
    var output = Object.assign({}, headers || {});

    if (root && root.AICMBusinessAIWorkerAuthTokenClient) {
      return root.AICMBusinessAIWorkerAuthTokenClient.buildHeaders(output);
    }

    if (root && typeof root.AICM_BUILD_AIWORKER_AUTH_HEADERS === "function") {
      return root.AICM_BUILD_AIWORKER_AUTH_HEADERS(output);
    }

    return output;
  }

  function fetchJson(path, params) {
    var config = getApiConfigClient();

    if (config && typeof config.fetchJson === "function") {
      return config.fetchJson(path, {
        method: "GET",
        params: params || {}
      });
    }

    if (!root || typeof root.fetch !== "function") {
      return Promise.reject(new Error("fetch_unavailable"));
    }

    return root.fetch(fallbackBuildUrl(path, params || {}), {
      method: "GET",
      headers: fallbackHeaders({})
    }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok) {
          var error = new Error(payload && payload.error ? payload.error : "api_request_failed");
          error.payload = payload;
          throw error;
        }

        return payload;
      });
    });
  }

  function listRoles(params) {
    return fetchJson("/api/v1/business/aiworker/reference/roles", params || {});
  }

  function listPersonalities(params) {
    return fetchJson("/api/v1/business/aiworker/reference/personalities", params || {});
  }

  function listPublicProfiles(params) {
    return fetchJson("/api/v1/business/aiworker/reference/public-profiles", params || {});
  }

  function listModelFull(params) {
    return fetchJson("/api/v1/business/aiworker/reference/model-full", params || {});
  }

  function init() {
    if (root) {
      root.AICM_AIWORKER_REFERENCE_LIST_ROLES = listRoles;
      root.AICM_AIWORKER_REFERENCE_LIST_PERSONALITIES = listPersonalities;
      root.AICM_AIWORKER_REFERENCE_LIST_PUBLIC_PROFILES = listPublicProfiles;
      root.AICM_AIWORKER_REFERENCE_LIST_MODEL_FULL = listModelFull;
    }

    return {
      ok: true
    };
  }

  if (root && root.document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  } else {
    init();
  }

  return {
    buildQuery: buildQuery,
    fallbackBuildUrl: fallbackBuildUrl,
    listRoles: listRoles,
    listPersonalities: listPersonalities,
    listPublicProfiles: listPublicProfiles,
    listModelFull: listModelFull,
    init: init
  };
});
