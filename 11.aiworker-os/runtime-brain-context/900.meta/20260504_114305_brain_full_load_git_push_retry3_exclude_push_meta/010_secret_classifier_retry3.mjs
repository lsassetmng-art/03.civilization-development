import fs from "node:fs";
import path from "node:path";

const targets = process.argv.slice(2);
if (targets.length === 0) throw new Error("target dirs required");

const maxBytes = 1024 * 1024 * 8;

const suspiciousPatterns = [
  { code: "postgres_url", re: /(postgres|postgresql):\/\/[^\s"'`<>]+/i },
  { code: "jwt_like", re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/ },
  { code: "service_role", re: /service_role/i },
  { code: "access_token", re: /access_token/i },
  { code: "refresh_token", re: /refresh_token/i },
  { code: "api_key", re: /\b(api_key|apikey)\b/i },
  { code: "database_url_assignment", re: /\b(?:PERSONA_)?DATABASE_URL\s*=\s*(?!NOT_USED\b|USED_READ_ONLY\b|PERSONA_DATABASE_URL\b)[^\s]+/i },
  { code: "supabase_url_review", re: /supabase\.co/i },
];

const safeLinePatterns = [
  /DATABASE_URL=NOT_USED/i,
  /PERSONA_DATABASE_URL=USED_READ_ONLY/i,
  /DB_ENV=PERSONA_DATABASE_URL/i,
  /DB env: PERSONA_DATABASE_URL/i,
  /DATABASE_URL: not used/i,
  /PERSONA_DATABASE_URL: used read.?only/i,
  /PERSONA_DATABASE_URL is not set/i,
  /ERROR: PERSONA_DATABASE_URL is not set/i,
];

function shouldSkip(file) {
  return (
    file.includes("/runtime-brain-context/900.meta/") &&
    (
      file.includes("_git_push") ||
      file.includes("secret_classifier") ||
      file.includes("secret_classification_report")
    )
  );
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (ent.name === ".git" || ent.name === "node_modules") continue;
      walk(p, out);
    } else if (ent.isFile()) {
      out.push(p);
    }
  }

  return out;
}

function isProbablyText(buffer) {
  const len = Math.min(buffer.length, 4096);
  for (let i = 0; i < len; i += 1) {
    if (buffer[i] === 0) return false;
  }
  return true;
}

let scannedFiles = 0;
let skippedPushMetaCount = 0;
let safeMarkerCount = 0;
let reviewOnlyCount = 0;
let suspiciousCount = 0;
const rows = [];

for (const target of targets) {
  for (const file of walk(target)) {
    if (shouldSkip(file)) {
      skippedPushMetaCount += 1;
      rows.push(`SKIP_PUSH_META file=${file}`);
      continue;
    }

    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }

    if (stat.size > maxBytes) {
      rows.push(`SKIP_LARGE file=${file}`);
      continue;
    }

    let buf;
    try {
      buf = fs.readFileSync(file);
    } catch {
      continue;
    }

    if (!isProbablyText(buf)) continue;
    scannedFiles += 1;

    const lines = buf.toString("utf8").split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      for (const pat of suspiciousPatterns) {
        if (!pat.re.test(line)) continue;

        if (safeLinePatterns.some((safePat) => safePat.test(line))) {
          safeMarkerCount += 1;
          rows.push(`SAFE_MARKER file=${file} line=${i + 1} pattern=${pat.code}`);
          continue;
        }

        if (pat.code === "supabase_url_review") {
          reviewOnlyCount += 1;
          rows.push(`REVIEW_ONLY file=${file} line=${i + 1} pattern=${pat.code}`);
          continue;
        }

        suspiciousCount += 1;
        rows.push(`SUSPICIOUS file=${file} line=${i + 1} pattern=${pat.code}`);
      }
    }
  }
}

console.log("SECRET_CLASSIFICATION_RESULT");
console.log(`SCANNED_FILES=${scannedFiles}`);
console.log(`SKIPPED_PUSH_META_COUNT=${skippedPushMetaCount}`);
console.log(`SAFE_MARKER_COUNT=${safeMarkerCount}`);
console.log(`REVIEW_ONLY_COUNT=${reviewOnlyCount}`);
console.log(`SUSPICIOUS_COUNT=${suspiciousCount}`);
console.log("DETAIL_BEGIN");
for (const row of rows.sort()) console.log(row);
console.log("DETAIL_END");

if (suspiciousCount > 0) process.exitCode = 2;
