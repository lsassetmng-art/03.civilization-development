(function (globalObject) {
  "use strict";

  var DEFAULT_LOCALE_CODE = "ja-jp";
  var DEFAULT_LANGUAGE_CODE = "ja";

  var CONTEXT_FIELD_NAMES = [
    "civilizationId",
    "civilization_id",
    "owner",
    "ownerId",
    "owner_id",
    "sessionRef",
    "session_ref",
    "sessionId",
    "session_id",
    "localeCode",
    "locale_code",
    "locale",
    "languageCode",
    "language_code",
    "language",
    "requestedOsCode",
    "requested_os_code",
    "returnTo",
    "return_to",
    "afterLoginPath",
    "after_login_path",
    "issuedAt",
    "issued_at",
    "expiresAt",
    "expires_at"
  ];

  var FORBIDDEN_FIELD_PATTERNS = [
    /password/i,
    /passwd/i,
    /access[_-]?token/i,
    /refresh[_-]?token/i,
    /client[_-]?secret/i,
    /service[_-]?role/i,
    /private[_-]?key/i,
    /^authorization$/i,
    /^database_url$/i,
    /^persona_database_url$/i
  ];

  var FORBIDDEN_VALUE_PATTERNS = [
    /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i,
    /sk-[A-Za-z0-9_-]{20,}/,
    /ghp_[A-Za-z0-9_]{20,}/,
    /xox[baprs]-[A-Za-z0-9-]{20,}/,
    /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/
  ];

  function safeString(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function toPlainObject(value) {
    return isPlainObject(value) ? value : {};
  }

  function isForbiddenFieldName(key) {
    var normalized = safeString(key);
    return FORBIDDEN_FIELD_PATTERNS.some(function (pattern) {
      return pattern.test(normalized);
    });
  }

  function stringLooksSecret(value) {
    var text = safeString(value);
    if (!text) return false;
    return FORBIDDEN_VALUE_PATTERNS.some(function (pattern) {
      return pattern.test(text);
    });
  }

  function collectForbiddenSignals(value, path, out) {
    if (value === null || value === undefined) return;

    if (typeof value === "string") {
      if (stringLooksSecret(value)) out.push(path || "value");
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(function (item, index) {
        collectForbiddenSignals(item, path + "[" + index + "]", out);
      });
      return;
    }

    if (typeof value === "object") {
      Object.keys(value).forEach(function (key) {
        var nextPath = path ? path + "." + key : key;
        if (isForbiddenFieldName(key)) {
          out.push(nextPath);
          return;
        }
        collectForbiddenSignals(value[key], nextPath, out);
      });
    }
  }

  function containsForbiddenAuthSecret(value) {
    var signals = [];
    collectForbiddenSignals(value, "", signals);
    return signals.length > 0;
  }

  function firstString(raw, names) {
    var source = toPlainObject(raw);
    for (var index = 0; index < names.length; index += 1) {
      var name = names[index];
      if (Object.prototype.hasOwnProperty.call(source, name)) {
        var value = safeString(source[name]);
        if (value && !stringLooksSecret(value)) return value;
      }
    }
    return "";
  }

  function normalizeLocaleCode(input) {
    var raw = safeString(input).replace("_", "-").toLowerCase();

    if (raw === "ja" || raw === "ja-jp") return "ja-jp";
    if (raw === "en" || raw === "en-us") return "en-us";

    return DEFAULT_LOCALE_CODE;
  }

  function localeCodeToLanguageCode(localeCode) {
    return normalizeLocaleCode(localeCode) === "en-us" ? "en" : DEFAULT_LANGUAGE_CODE;
  }

  function parseJsonObject(value) {
    if (!value) return {};
    if (isPlainObject(value)) return value;

    try {
      var parsed = JSON.parse(String(value));
      return toPlainObject(parsed);
    } catch (error) {
      return {};
    }
  }

  function hasAnyContextField(value) {
    var source = toPlainObject(value);
    return CONTEXT_FIELD_NAMES.some(function (key) {
      return Object.prototype.hasOwnProperty.call(source, key);
    });
  }

  function getLocalStorageItem(key) {
    try {
      if (!globalObject.localStorage) return "";
      return globalObject.localStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function localStorageObject(key) {
    return parseJsonObject(getLocalStorageItem(key));
  }

  function normalizeLoginContext(raw, sourceName, compatibility) {
    var source = toPlainObject(raw);
    var warnings = [];

    if (containsForbiddenAuthSecret(source)) {
      warnings.push("FORBIDDEN_AUTH_SECRET_FIELD_STRIPPED");
    }

    if (compatibility) {
      warnings.push("COMPATIBILITY_SURFACE_BUSINESSOS_LOGIN_CONTEXT");
    }

    var localeInput = firstString(source, [
      "localeCode",
      "locale_code",
      "locale",
      "languageCode",
      "language_code",
      "language"
    ]);

    var localeCode = normalizeLocaleCode(localeInput);
    var languageCode = localeCodeToLanguageCode(localeCode);

    var context = {
      civilizationId: firstString(source, ["civilizationId", "civilization_id"]),
      owner: firstString(source, ["owner", "ownerId", "owner_id"]),
      localeCode: localeCode,
      languageCode: languageCode
    };

    var sessionRef = firstString(source, ["sessionRef", "session_ref", "sessionId", "session_id"]);
    var requestedOsCode = firstString(source, ["requestedOsCode", "requested_os_code"]);
    var returnTo = firstString(source, ["returnTo", "return_to"]);
    var afterLoginPath = firstString(source, ["afterLoginPath", "after_login_path"]);
    var issuedAt = firstString(source, ["issuedAt", "issued_at"]);
    var expiresAt = firstString(source, ["expiresAt", "expires_at"]);

    if (sessionRef) context.sessionRef = sessionRef;
    if (requestedOsCode) context.requestedOsCode = requestedOsCode;
    if (returnTo) context.returnTo = returnTo;
    if (afterLoginPath) context.afterLoginPath = afterLoginPath;
    if (issuedAt) context.issuedAt = issuedAt;
    if (expiresAt) context.expiresAt = expiresAt;

    if (!context.civilizationId) warnings.push("MISSING_CIVILIZATION_ID");
    if (!context.owner) warnings.push("MISSING_OWNER");

    return {
      context: context,
      source: sourceName || "object",
      trustStatus: "parsed_only_not_authenticated",
      warnings: warnings
    };
  }

  function readUrlContext() {
    var SearchParams = globalObject.URLSearchParams || (typeof URLSearchParams !== "undefined" ? URLSearchParams : null);
    var fromUrl = {};

    if (!SearchParams) return fromUrl;

    try {
      var search = globalObject.location && globalObject.location.search ? globalObject.location.search : "";
      var params = new SearchParams(search);

      CONTEXT_FIELD_NAMES.forEach(function (key) {
        var value = params.get(key);
        if (value) fromUrl[key] = value;
      });
    } catch (error) {
      return {};
    }

    return fromUrl;
  }

  function readLocaleFallbackContext() {
    var portalLocale = getLocalStorageItem("portal.locale") ||
      getLocalStorageItem("portal.language") ||
      getLocalStorageItem("civilization.portal.locale");

    if (!portalLocale) return {};

    return {
      localeCode: portalLocale,
      languageCode: portalLocale
    };
  }

  function readEnvelope() {
    var fromUrl = readUrlContext();
    if (hasAnyContextField(fromUrl)) {
      return normalizeLoginContext(fromUrl, "url", false);
    }

    if (hasAnyContextField(globalObject.CivilizationLoginContext)) {
      return normalizeLoginContext(globalObject.CivilizationLoginContext, "window.CivilizationLoginContext", false);
    }

    var localCivilization = localStorageObject("civilization.loginContext");
    if (hasAnyContextField(localCivilization)) {
      return normalizeLoginContext(localCivilization, "localStorage.civilization.loginContext", false);
    }

    if (hasAnyContextField(globalObject.BusinessOSLoginContext)) {
      return normalizeLoginContext(globalObject.BusinessOSLoginContext, "window.BusinessOSLoginContext.compatibility", true);
    }

    var localBusiness = localStorageObject("businessos.loginContext");
    if (hasAnyContextField(localBusiness)) {
      return normalizeLoginContext(localBusiness, "localStorage.businessos.loginContext.compatibility", true);
    }

    var localeFallback = readLocaleFallbackContext();
    if (hasAnyContextField(localeFallback)) {
      return normalizeLoginContext(localeFallback, "localStorage.localeFallback", false);
    }

    return normalizeLoginContext({}, "empty", false);
  }

  function cloneObject(value) {
    var source = toPlainObject(value);
    var out = {};
    Object.keys(source).forEach(function (key) {
      out[key] = source[key];
    });
    return out;
  }

  function buildHeaders(context) {
    var headers = {};
    var source = toPlainObject(context);

    if (source.civilizationId) headers["x-civilization-id"] = source.civilizationId;
    if (source.owner) headers["x-owner"] = source.owner;
    if (source.sessionRef) headers["x-civilization-session-ref"] = source.sessionRef;
    if (source.localeCode) headers["x-locale-code"] = source.localeCode;
    if (source.languageCode) headers["x-language-code"] = source.languageCode;
    if (source.requestedOsCode) headers["x-requested-os-code"] = source.requestedOsCode;
    if (source.returnTo) headers["x-return-to"] = source.returnTo;
    if (source.afterLoginPath) headers["x-after-login-path"] = source.afterLoginPath;

    return headers;
  }

  function applyDocumentMetadata(envelope) {
    var doc = globalObject.document;
    if (!doc || !doc.documentElement) return;

    var root = doc.documentElement;
    var context = envelope.context || {};

    root.lang = context.languageCode || DEFAULT_LANGUAGE_CODE;

    if (!root.dataset) return;

    root.dataset.localeCode = context.localeCode || DEFAULT_LOCALE_CODE;
    root.dataset.languageCode = context.languageCode || DEFAULT_LANGUAGE_CODE;
    root.dataset.civilizationContextSource = envelope.source || "empty";
    root.dataset.civilizationContextTrust = envelope.trustStatus || "parsed_only_not_authenticated";
  }

  var envelope = readEnvelope();
  applyDocumentMetadata(envelope);

  globalObject.BusinessOSCivilizationContext = Object.freeze({
    context: Object.freeze(cloneObject(envelope.context)),
    source: envelope.source,
    trustStatus: envelope.trustStatus,
    warnings: Object.freeze(envelope.warnings.slice()),
    getContext: function () {
      return cloneObject(envelope.context);
    },
    getHeaders: function () {
      return buildHeaders(envelope.context);
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
