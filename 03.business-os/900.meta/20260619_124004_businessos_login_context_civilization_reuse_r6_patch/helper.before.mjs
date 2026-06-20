const DEFAULT_LOCALE_CODE = "ja-jp";
const DEFAULT_LANGUAGE_CODE = "ja";

export const BUSINESSOS_LOGIN_CONTEXT_ALLOWED_LOCALE_CODES = Object.freeze(["ja-jp", "en-us"]);
export const BUSINESSOS_LOGIN_CONTEXT_ALLOWED_LANGUAGE_CODES = Object.freeze(["ja", "en"]);

const FORBIDDEN_FIELD_PATTERNS = [
  /password/i,
  /passwd/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /client[_-]?secret/i,
  /service[_-]?role/i,
  /service[_-]?role[_-]?key/i,
  /private[_-]?key/i,
  /^authorization$/i,
  /^database_url$/i,
  /^persona_database_url$/i
];

const FORBIDDEN_VALUE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i,
  /sk-[A-Za-z0-9_-]{20,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/
];

function toPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function safeString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeKey(key) {
  return String(key || "").trim();
}

function isForbiddenFieldName(key) {
  const normalized = normalizeKey(key);
  return FORBIDDEN_FIELD_PATTERNS.some((pattern) => pattern.test(normalized));
}

function stringLooksSecret(value) {
  const text = safeString(value);
  if (!text) return false;
  return FORBIDDEN_VALUE_PATTERNS.some((pattern) => pattern.test(text));
}

function firstString(raw, names) {
  const source = toPlainObject(raw);
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(source, name)) {
      const value = safeString(source[name]);
      if (value) return value;
    }
  }
  return "";
}

function collectForbiddenSignals(value, path, out) {
  if (value === null || value === undefined) return;

  if (typeof value === "string") {
    if (stringLooksSecret(value)) out.push(path || "value");
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenSignals(item, `${path}[${index}]`, out));
    return;
  }

  if (typeof value === "object") {
    Object.keys(value).forEach((key) => {
      const nextPath = path ? `${path}.${key}` : key;
      if (isForbiddenFieldName(key)) {
        out.push(nextPath);
        return;
      }
      collectForbiddenSignals(value[key], nextPath, out);
    });
  }
}

export function businessosNormalizeLocaleCode(input) {
  const raw = safeString(input).replace("_", "-").toLowerCase();

  if (raw === "ja" || raw === "ja-jp") return "ja-jp";
  if (raw === "en" || raw === "en-us") return "en-us";

  return DEFAULT_LOCALE_CODE;
}

export function businessosLocaleCodeToLanguageCode(localeCode) {
  return businessosNormalizeLocaleCode(localeCode) === "en-us" ? "en" : "ja";
}

export function businessosContainsForbiddenAuthSecret(value) {
  const signals = [];
  collectForbiddenSignals(value, "", signals);
  return signals.length > 0;
}

export function businessosRedactLoginContextForLog(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return stringLooksSecret(value) ? "[REDACTED]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => businessosRedactLoginContextForLog(item));
  }

  if (typeof value === "object") {
    const out = {};
    Object.keys(value).forEach((key) => {
      if (isForbiddenFieldName(key)) {
        out[key] = "[REDACTED]";
      } else {
        out[key] = businessosRedactLoginContextForLog(value[key]);
      }
    });
    return out;
  }

  return value;
}

export function businessosNormalizeLoginContext(raw, options = {}) {
  const sourceObject = toPlainObject(raw);
  const warnings = [];

  if (businessosContainsForbiddenAuthSecret(sourceObject)) {
    warnings.push("FORBIDDEN_AUTH_SECRET_FIELD_STRIPPED");
  }

  const inputLocale = firstString(sourceObject, ["localeCode", "locale_code", "locale", "languageCode", "language_code", "language"]);
  const localeCode = businessosNormalizeLocaleCode(inputLocale);
  const languageCode = businessosLocaleCodeToLanguageCode(localeCode);

  const civilizationId = firstString(sourceObject, ["civilizationId", "civilization_id"]);
  const owner = firstString(sourceObject, ["owner", "ownerId", "owner_id"]);
  const sessionRef = firstString(sourceObject, ["sessionRef", "session_ref", "sessionId", "session_id"]);

  if (!civilizationId) warnings.push("MISSING_CIVILIZATION_ID");
  if (!owner) warnings.push("MISSING_OWNER");

  const context = {
    civilizationId,
    owner,
    localeCode,
    languageCode
  };

  if (sessionRef) context.sessionRef = sessionRef;

  const requestedOsCode = firstString(sourceObject, ["requestedOsCode", "requested_os_code"]);
  const returnTo = firstString(sourceObject, ["returnTo", "return_to"]);
  const afterLoginPath = firstString(sourceObject, ["afterLoginPath", "after_login_path"]);
  const issuedAt = firstString(sourceObject, ["issuedAt", "issued_at"]);
  const expiresAt = firstString(sourceObject, ["expiresAt", "expires_at"]);

  if (requestedOsCode) context.requestedOsCode = requestedOsCode;
  if (returnTo) context.returnTo = returnTo;
  if (afterLoginPath) context.afterLoginPath = afterLoginPath;
  if (issuedAt) context.issuedAt = issuedAt;
  if (expiresAt) context.expiresAt = expiresAt;

  return {
    context,
    source: options.source || "object",
    trustStatus: "parsed_only_not_authenticated",
    warnings
  };
}

function parseJsonObject(value) {
  if (!value) return {};
  if (typeof value === "object") return toPlainObject(value);
  try {
    return toPlainObject(JSON.parse(String(value)));
  } catch {
    return {};
  }
}

function hasAnyContextField(value) {
  const source = toPlainObject(value);
  return [
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
    "languageCode",
    "language_code",
    "requestedOsCode",
    "requested_os_code",
    "returnTo",
    "return_to",
    "afterLoginPath",
    "after_login_path"
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));
}

function getLocalStorage(globalObject, key) {
  try {
    if (!globalObject || !globalObject.localStorage) return "";
    return globalObject.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

export function businessosReadLoginContextFromBrowser(globalObject = globalThis) {
  const win = globalObject && globalObject.window ? globalObject.window : globalObject;

  try {
    const search = win && win.location && win.location.search ? win.location.search : "";
    const params = new URLSearchParams(search);
    const fromUrl = {};
    [
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
      "languageCode",
      "language_code",
      "requestedOsCode",
      "requested_os_code",
      "returnTo",
      "return_to",
      "afterLoginPath",
      "after_login_path"
    ].forEach((key) => {
      const value = params.get(key);
      if (value) fromUrl[key] = value;
    });

    if (hasAnyContextField(fromUrl)) {
      return businessosNormalizeLoginContext(fromUrl, { source: "url" });
    }
  } catch {
    return businessosNormalizeLoginContext({}, { source: "empty" });
  }

  if (win && hasAnyContextField(win.BusinessOSLoginContext)) {
    return businessosNormalizeLoginContext(win.BusinessOSLoginContext, { source: "window" });
  }

  if (win && hasAnyContextField(win.CivilizationLoginContext)) {
    return businessosNormalizeLoginContext(win.CivilizationLoginContext, { source: "window" });
  }

  const localBusiness = parseJsonObject(getLocalStorage(win, "businessos.loginContext"));
  if (hasAnyContextField(localBusiness)) {
    return businessosNormalizeLoginContext(localBusiness, { source: "localStorage" });
  }

  const localCivilization = parseJsonObject(getLocalStorage(win, "civilization.loginContext"));
  if (hasAnyContextField(localCivilization)) {
    return businessosNormalizeLoginContext(localCivilization, { source: "localStorage" });
  }

  return businessosNormalizeLoginContext({}, { source: "empty" });
}

function headerValue(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return safeString(headers.get(name) || headers.get(name.toLowerCase()) || headers.get(name.toUpperCase()));
  }

  const direct = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  return safeString(direct);
}

export function businessosReadLoginContextFromRequestLike(requestLike = {}) {
  const request = toPlainObject(requestLike);

  if (hasAnyContextField(request.context)) {
    return businessosNormalizeLoginContext(request.context, { source: "object" });
  }

  if (hasAnyContextField(request.body && request.body.context)) {
    return businessosNormalizeLoginContext(request.body.context, { source: "object" });
  }

  if (hasAnyContextField(request.body)) {
    return businessosNormalizeLoginContext(request.body, { source: "object" });
  }

  const headers = request.headers || {};
  const fromHeaders = {
    civilizationId: headerValue(headers, "x-civilization-id"),
    owner: headerValue(headers, "x-business-owner") || headerValue(headers, "x-owner"),
    sessionRef: headerValue(headers, "x-civilization-session-ref") || headerValue(headers, "x-session-ref"),
    localeCode: headerValue(headers, "x-locale-code"),
    languageCode: headerValue(headers, "x-language-code"),
    requestedOsCode: headerValue(headers, "x-requested-os-code"),
    returnTo: headerValue(headers, "x-return-to"),
    afterLoginPath: headerValue(headers, "x-after-login-path")
  };

  if (hasAnyContextField(fromHeaders)) {
    return businessosNormalizeLoginContext(fromHeaders, { source: "header" });
  }

  if (hasAnyContextField(request.query)) {
    return businessosNormalizeLoginContext(request.query, { source: "query" });
  }

  return businessosNormalizeLoginContext({}, { source: "empty" });
}
