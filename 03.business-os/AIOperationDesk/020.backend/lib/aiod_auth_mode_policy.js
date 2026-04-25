import { readEnv } from "./aiod_env.js";

export function getRecommendedAuthMode() {
  const explicit = readEnv("AIOD_AUTH_MODE", "");
  if (explicit) {
    return explicit;
  }
  return "header_trusted_strict";
}

export function isStrictAuthCandidate() {
  return getRecommendedAuthMode() === "header_trusted_strict";
}
