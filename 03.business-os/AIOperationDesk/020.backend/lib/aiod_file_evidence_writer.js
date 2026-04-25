import { readEnv } from "./aiod_env.js";

function appRoot() {
  const home = readEnv("HOME", "");
  if (!home) {
    throw new Error("HOME is not set.");
  }
  return `${home}/03.civilization-development/03.business-os/AIOperationDesk`;
}

function stamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) + "_" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export async function writeRuntimeEvidence(prefix, payload = {}) {
  const dir = `${appRoot()}/900.meta/runtime_evidence`;
  await Deno.mkdir(dir, { recursive: true });

  const filePath = `${dir}/${prefix}_${stamp()}.json`;
  await Deno.writeTextFile(filePath, JSON.stringify(payload, null, 2) + "\n");

  return filePath;
}

export function shouldWriteRuntimeEvidence() {
  return readEnv("AIOD_WRITE_RUNTIME_EVIDENCE", "false") === "true";
}
