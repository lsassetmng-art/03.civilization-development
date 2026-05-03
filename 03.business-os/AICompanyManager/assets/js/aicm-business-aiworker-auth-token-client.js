(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(typeof globalThis !== "undefined" ? globalThis : undefined);
  } else {
    root.AICMBusinessAIWorkerAuthTokenClient = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var STORAGE_KEY = "aicm_business_aiworker_api_token";
  var HEADER_NAME = "X-AICM-AIWORKER-TOKEN";

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function getToken() {
    if (root && root.AICM_BUSINESS_AIWORKER_API_TOKEN) {
      return text(root.AICM_BUSINESS_AIWORKER_API_TOKEN);
    }

    try {
      if (root && root.localStorage) {
        return text(root.localStorage.getItem(STORAGE_KEY));
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function setToken(token) {
    var value = text(token);

    if (root) {
      root.AICM_BUSINESS_AIWORKER_API_TOKEN = value;
    }

    try {
      if (root && root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, value);
      }
    } catch (error) {
      return {
        ok: false,
        error: "localStorage_write_failed",
        detail: error.message
      };
    }

    return {
      ok: true,
      token_set: Boolean(value)
    };
  }

  function clearToken() {
    if (root) {
      root.AICM_BUSINESS_AIWORKER_API_TOKEN = "";
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
      ok: true
    };
  }

  function buildHeaders(extraHeaders) {
    var headers = Object.assign({}, extraHeaders || {});
    var token = getToken();

    if (token) {
      headers[HEADER_NAME] = token;
    }

    return headers;
  }

  function installFetchHelper() {
    if (!root) {
      return {
        ok: false,
        reason: "root_unavailable"
      };
    }

    root.AICM_BUILD_AIWORKER_AUTH_HEADERS = buildHeaders;

    return {
      ok: true,
      helper: "AICM_BUILD_AIWORKER_AUTH_HEADERS"
    };
  }

  function init() {
    installFetchHelper();

    return {
      ok: true,
      token_set: Boolean(getToken())
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
    HEADER_NAME: HEADER_NAME,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    buildHeaders: buildHeaders,
    installFetchHelper: installFetchHelper,
    init: init
  };
});
