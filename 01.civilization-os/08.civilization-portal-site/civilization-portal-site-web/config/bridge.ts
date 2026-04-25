export const AUTH_BRIDGE_ENV_KEYS = {
  mode: "NEXT_PUBLIC_CIVILIZATION_AUTH_BRIDGE_MODE",
  authorizeUrl: "NEXT_PUBLIC_CIVILIZATION_AUTH_AUTHORIZE_URL",
  sessionUrl: "NEXT_PUBLIC_CIVILIZATION_AUTH_SESSION_URL",
} as const;

const rawMode = process.env.NEXT_PUBLIC_CIVILIZATION_AUTH_BRIDGE_MODE;

export const AUTH_BRIDGE_CONFIG = {
  mode: rawMode === "external_stub" ? "external_stub" : "mock",
  external: {
    authorizeUrl: process.env.NEXT_PUBLIC_CIVILIZATION_AUTH_AUTHORIZE_URL ?? "",
    sessionUrl: process.env.NEXT_PUBLIC_CIVILIZATION_AUTH_SESSION_URL ?? "",
  },
} as const;
