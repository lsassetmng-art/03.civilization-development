/**
 * CivilizationOS-owned one-time Persona handoff ledger.
 * Requires CIVILIZATION_PERSONA_HANDOFF_DATABASE_URL with a dedicated
 * least-privilege role that has EXECUTE on two civilization RPC functions.
 * No table writes from browser/Portal/PersonaOS.
 */
import { createHash } from "node:crypto";
import { Pool } from "pg";

type LedgerStatus = "ok" | "rejected" | "unavailable";

type LedgerInput = {
  code: string;
  actorKey: string;
  stateHash: string;
  pkceChallenge: string;
  callbackUrl: string;
};

const BASE64URL = /^[A-Za-z0-9_-]+$/;
let pool: Pool | null = null;

function validConfiguredDatabase(): string | null {
  const raw = process.env.CIVILIZATION_PERSONA_HANDOFF_DATABASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname ||
      !url.username ||
      !url.password
    ) return null;
    url.searchParams.delete("uselibpqcompat");
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch {
    return null;
  }
}

function ledgerPool(): Pool | null {
  if (pool) return pool;
  const connectionString = validConfiguredDatabase();
  if (!connectionString) return null;
  try {
    pool = new Pool({
      connectionString,
      max: 3,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true
    });
    return pool;
  } catch {
    return null;
  }
}

function validatedArgs(input: LedgerInput): unknown[] | null {
  try {
    if (
      typeof input.code !== "string" ||
      input.code.length < 64 ||
      input.code.length > 4096 ||
      typeof input.actorKey !== "string" ||
      input.actorKey.length < 1 ||
      input.actorKey.length > 256 ||
      /[\u0000-\u001f\u007f]/.test(input.actorKey) ||
      typeof input.stateHash !== "string" ||
      input.stateHash.length !== 43 ||
      !BASE64URL.test(input.stateHash) ||
      typeof input.pkceChallenge !== "string" ||
      input.pkceChallenge.length !== 43 ||
      !BASE64URL.test(input.pkceChallenge)
    ) return null;

    const callback = new URL(input.callbackUrl);
    const secure = callback.protocol === "https:";
    if (
      !secure || callback.username || callback.password ||
      callback.search || callback.hash ||
      ![
        "/api/persona/auth/callback",
        "/persona-menu/api/auth/callback"
      ].includes(callback.pathname)
    ) return null;

    return [
      createHash("sha256").update(input.code, "utf8").digest(),
      input.actorKey,
      Buffer.from(input.stateHash, "base64url"),
      input.pkceChallenge,
      callback.origin,
      callback.pathname
    ];
  } catch {
    return null;
  }
}

async function invoke(
  action: "issue" | "consume",
  input: LedgerInput
): Promise<LedgerStatus> {
  const args = validatedArgs(input);
  if (!args) return "rejected";

  const connection = ledgerPool();
  if (!connection) return "unavailable";

  const sql = action === "issue"
    ? "SELECT civilization.persona_handoff_issue_v1($1::bytea,$2::text,$3::bytea,$4::text,$5::text,$6::text) AS ok"
    : "SELECT civilization.persona_handoff_consume_v1($1::bytea,$2::text,$3::bytea,$4::text,$5::text,$6::text) AS ok";

  try {
    const result = await connection.query<{ ok: boolean }>(sql, args);
    return result.rows.length === 1 && result.rows[0]?.ok === true
      ? "ok"
      : "rejected";
  } catch {
    // No SQL, token, actor or credential details in public logs.
    return "unavailable";
  }
}

export async function recordPersonaHandoff(input: LedgerInput): Promise<LedgerStatus> {
  return invoke("issue", input);
}

export async function consumePersonaHandoff(input: LedgerInput): Promise<LedgerStatus> {
  return invoke("consume", input);
}
