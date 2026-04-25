import { readEnv } from "./aiod_env.js";

export function hasSecret(name) {
  return readEnv(name, "") !== "";
}

export function requireSecret(name) {
  const value = readEnv(name, "");
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function getProviderSecretPresence() {
  return {
    AIOD_LINE_CHANNEL_ACCESS_TOKEN: hasSecret("AIOD_LINE_CHANNEL_ACCESS_TOKEN"),
    AIOD_LINE_CHANNEL_SECRET: hasSecret("AIOD_LINE_CHANNEL_SECRET"),
    AIOD_NOTIFICATION_SIGNING_KEY: hasSecret("AIOD_NOTIFICATION_SIGNING_KEY")
  };
}
