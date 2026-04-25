#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/runtime_evidence_digest_$(date +%Y%m%d_%H%M%S)"
TMP_JS="$OUT_DIR/000_runtime_evidence_digest.mjs"

mkdir -p "$OUT_DIR"

cat > "$TMP_JS" <<'EOF_DIGEST_JS'
const home = Deno.env.get("HOME");
if (!home) throw new Error("HOME is not set.");

const appRoot = `${home}/03.civilization-development/03.business-os/AIOperationDesk`;
const runtimeDir = `${appRoot}/900.meta/runtime_evidence`;
const outDir = Deno.env.get("AIOD_DIGEST_OUT_DIR");
if (!outDir) throw new Error("AIOD_DIGEST_OUT_DIR is not set.");

const providerItems = [];
const replayItems = [];

async function exists(path) {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

if (await exists(runtimeDir)) {
  for await (const entry of Deno.readDir(runtimeDir)) {
    if (!entry.isFile || !entry.name.endsWith(".json")) continue;
    const filePath = `${runtimeDir}/${entry.name}`;
    const text = await Deno.readTextFile(filePath);
    const data = JSON.parse(text);

    if (entry.name.startsWith("provider_live_")) {
      providerItems.push({ file: filePath, data });
    } else if (entry.name.startsWith("replay_live_")) {
      replayItems.push({ file: filePath, data });
    }
  }
}

providerItems.sort((a, b) => a.file.localeCompare(b.file));
replayItems.sort((a, b) => a.file.localeCompare(b.file));

const providerSummary = {
  total_count: providerItems.length,
  sent_count: providerItems.filter(x => x.data.delivery_status === "sent").length,
  failed_count: providerItems.filter(x => x.data.delivery_status === "failed").length,
  cancelled_count: providerItems.filter(x => x.data.delivery_status === "cancelled").length,
  latest_file: providerItems.length ? providerItems[providerItems.length - 1].file : null
};

const replaySummary = {
  total_count: replayItems.length,
  sent_like_count: replayItems.filter(x => x.data.provider_delivery_status === "sent").length,
  non_sent_count: replayItems.filter(x => x.data.provider_delivery_status !== "sent").length,
  latest_file: replayItems.length ? replayItems[replayItems.length - 1].file : null
};

const summary = {
  runtime_dir: runtimeDir,
  provider_summary: providerSummary,
  replay_summary: replaySummary
};

await Deno.writeTextFile(`${outDir}/000_RUNTIME_EVIDENCE_DIGEST.json`, JSON.stringify(summary, null, 2) + "\n");

const md = `# ============================================================
# AI OPERATION DESK RUNTIME EVIDENCE DIGEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

runtime_dir:
- ${summary.runtime_dir}

provider_summary:
- total_count: ${providerSummary.total_count}
- sent_count: ${providerSummary.sent_count}
- failed_count: ${providerSummary.failed_count}
- cancelled_count: ${providerSummary.cancelled_count}
- latest_file: ${providerSummary.latest_file ?? "NOT_FOUND"}

replay_summary:
- total_count: ${replaySummary.total_count}
- sent_like_count: ${replaySummary.sent_like_count}
- non_sent_count: ${replaySummary.non_sent_count}
- latest_file: ${replaySummary.latest_file ?? "NOT_FOUND"}
`;
await Deno.writeTextFile(`${outDir}/000_RUNTIME_EVIDENCE_DIGEST.md`, md);
EOF_DIGEST_JS

AIOD_DIGEST_OUT_DIR="$OUT_DIR"
export AIOD_DIGEST_OUT_DIR

deno run --allow-env --allow-read --allow-write "$TMP_JS"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK RUNTIME EVIDENCE DIGEST DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
sed -n '1,180p' "$OUT_DIR/000_RUNTIME_EVIDENCE_DIGEST.md"
