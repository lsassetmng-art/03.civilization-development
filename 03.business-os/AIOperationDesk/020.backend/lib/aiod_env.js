export function readEnv(name, fallback = "") {
  return globalThis.Deno?.env?.get?.(name) ?? fallback;
}

export function requireEnv(name) {
  const value = readEnv(name, "");
  if (!value) {
    throw new Error(`${name} is not set.`);
  }
  return value;
}

export function getRuntimeConfig() {
  return {
    AIOD_PORT: readEnv("AIOD_PORT", "8787"),
    AIOD_WEB_PORT: readEnv("AIOD_WEB_PORT", "8087"),
    AIOD_DATA_MODE: readEnv("AIOD_DATA_MODE", "mock"),
    PERSONA_DATABASE_URL_SET: readEnv("PERSONA_DATABASE_URL", "") !== "",
    LINE_PROVIDER_MODE: readEnv("AIOD_LINE_PROVIDER_MODE", "stub"),
    AUTH_MODE: readEnv("AIOD_AUTH_MODE", "stub"),
    PERMISSION_MODE: readEnv("AIOD_PERMISSION_MODE", "stub")
  };
}
