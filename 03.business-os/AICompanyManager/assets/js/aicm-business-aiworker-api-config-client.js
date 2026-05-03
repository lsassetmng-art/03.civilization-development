(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerApiConfigClient = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var STORAGE_KEY = "aicm_business_aiworker_api_base_url";
  var DEFAULT_BASE_URL = "http://127.0.0.1:8801";

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function normalizeBaseUrl(value) {
    var url = text(value);
    if (!url) return DEFAULT_BASE_URL;
    return url.replace(/\/+$/, "");
  }

  function getBaseUrl() {
    if (root && root.AICM_BUSINESS_AIWORKER_API_BASE_URL) {
      return normalizeBaseUrl(root.AICM_BUSINESS_AIWORKER_API_BASE_URL);
    }

    try {
      if (root && root.localStorage) {
        var stored = root.localStorage.getItem(STORAGE_KEY);
        if (text(stored)) return normalizeBaseUrl(stored);
      }
    } catch (error) {
      return DEFAULT_BASE_URL;
    }

    return DEFAULT_BASE_URL;
  }

  function setBaseUrl(url) {
    var normalized = normalizeBaseUrl(url);

    if (root) {
      root.AICM_BUSINESS_AIWORKER_API_BASE_URL = normalized;
    }

    try {
      if (root && root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, normalized);
      }
    } catch (error) {
      return {
        ok: false,
        error: "localStorage_write_failed",
        detail: error.message,
        base_url: normalized
      };
    }

    return {
      ok: true,
      base_url: normalized
    };
  }

  function clearBaseUrl() {
    if (root) {
      root.AICM_BUSINESS_AIWORKER_API_BASE_URL = "";
    }

    try {
      if (root && root.localStorage) {
        root.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      return {
        ok: false,
        error: "localStorage_clear_failed",
        detail: error.message
      };
    }

    return {
      ok: true,
      base_url: DEFAULT_BASE_URL
    };
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

  function buildUrl(path, params) {
    var p = text(path);
    if (!p) p = "/";
    if (p.charAt(0) !== "/") p = "/" + p;

    return getBaseUrl() + p + buildQuery(params || {});
  }

  function buildAuthHeaders(extraHeaders) {
    var headers = Object.assign({}, extraHeaders || {});

    if (root && root.AICMBusinessAIWorkerAuthTokenClient) {
      return root.AICMBusinessAIWorkerAuthTokenClient.buildHeaders(headers);
    }

    if (root && typeof root.AICM_BUILD_AIWORKER_AUTH_HEADERS === "function") {
      return root.AICM_BUILD_AIWORKER_AUTH_HEADERS(headers);
    }

    return headers;
  }

  function buildFetchOptions(options) {
    var input = options || {};
    var headers = buildAuthHeaders(input.headers || {});

    if (input.json !== undefined) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    var fetchOptions = Object.assign({}, input, {
      headers: headers
    });

    if (input.json !== undefined) {
      fetchOptions.body = JSON.stringify(input.json);
      delete fetchOptions.json;
    }

    return fetchOptions;
  }

  function fetchJson(path, options) {
    if (!root || typeof root.fetch !== "function") {
      return Promise.reject(new Error("fetch_unavailable"));
    }

    return root.fetch(buildUrl(path, options && options.params), buildFetchOptions(options))
      .then(function (response) {
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

  function installGlobalHelpers() {
    if (!root) {
      return {
        ok: false,
        reason: "root_unavailable"
      };
    }

    root.AICM_BUSINESS_AIWORKER_API_BASE_URL = getBaseUrl();
    root.AICM_BUILD_AIWORKER_API_URL = buildUrl;
    root.AICM_BUILD_AIWORKER_FETCH_OPTIONS = buildFetchOptions;
    root.AICM_FETCH_AIWORKER_JSON = fetchJson;

    return {
      ok: true,
      base_url: getBaseUrl()
    };
  }

  function init() {
    installGlobalHelpers();

    return {
      ok: true,
      base_url: getBaseUrl()
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
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_BASE_URL: DEFAULT_BASE_URL,
    normalizeBaseUrl: normalizeBaseUrl,
    getBaseUrl: getBaseUrl,
    setBaseUrl: setBaseUrl,
    clearBaseUrl: clearBaseUrl,
    buildQuery: buildQuery,
    buildUrl: buildUrl,
    buildAuthHeaders: buildAuthHeaders,
    buildFetchOptions: buildFetchOptions,
    fetchJson: fetchJson,
    installGlobalHelpers: installGlobalHelpers,
    init: init
  };
});
