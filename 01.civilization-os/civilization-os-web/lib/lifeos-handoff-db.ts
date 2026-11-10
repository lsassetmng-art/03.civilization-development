import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

const opaque = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
const digest = (v: string): Buffer => createHash("sha256").update(v, "utf8").digest();
let pool: Pool | undefined;
function database(): Pool {
  if (pool) return pool;
  const raw = process.env.LIFEOS_HANDOFF_DATABASE_URL;
  if (!raw) throw new Error("lifeos_db_not_configured");
  const url = new URL(raw);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.username || !url.password) throw new Error("lifeos_db_invalid");
  // Verify the TLS certificate. The runtime connection must be a dedicated non-BYPASSRLS role.
  url.searchParams.set("sslmode", "verify-full");
  pool = new Pool({ connectionString: url.toString(), max: 3, connectionTimeoutMillis: 3000, query_timeout: 5000 });
  return pool;
}
export type LifeosExchangeSession = {
  civilizationId: string;
  sid: string;
};

const validSid = (v: unknown): v is string =>
  typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);

export async function issueLifeosCode(
  id: string,
  sid: string,
  expiresAt: string,
  origin: string,
  state: unknown,
  challenge: unknown
): Promise<string | null> {
  if (!opaque(state) || !opaque(challenge) ||
      !validSid(sid) || !id || id.length > 256 ||
      !Number.isFinite(Date.parse(expiresAt)) ||
      Date.parse(expiresAt) <= Date.now()) return null;

  const code = randomBytes(32).toString("base64url");
  const result = await database().query<{ lifeos_handoff_issue_session: boolean }>(
    "SELECT civilization.lifeos_handoff_issue_session($1,$2,$3,$4,$5,$6,$7,$8)",
    [digest(code), id, sid, digest(sid), expiresAt, origin, challenge, digest(state)]
  );
  return result.rows[0]?.lifeos_handoff_issue_session === true ? code : null;
}

export async function consumeLifeosCode(
  code: unknown,
  origin: string,
  state: unknown,
  verifier: unknown
): Promise<LifeosExchangeSession | null> {
  if (!opaque(code) || !opaque(state) || !opaque(verifier)) return null;
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const result = await database().query<{
    civilization_id: string;
    session_id: string;
  }>(
    "SELECT civilization_id,session_id FROM civilization.lifeos_handoff_consume_session($1,$2,$3,$4)",
    [digest(code), origin, challenge, digest(state)]
  );
  if (result.rows.length !== 1 || !validSid(result.rows[0].session_id)) return null;
  return {
    civilizationId: result.rows[0].civilization_id,
    sid: result.rows[0].session_id
  };
}

export async function revokeLifeosSession(sid: string): Promise<boolean> {
  if (!validSid(sid)) return false;
  const result = await database().query<{ lifeos_session_revoke: boolean }>(
    "SELECT civilization.lifeos_session_revoke($1)",
    [digest(sid)]
  );
  return result.rows[0]?.lifeos_session_revoke === true;
}

export async function validLifeosSession(
  id: string,
  sid: string
): Promise<boolean> {
  if (!id || id.length > 256 || !validSid(sid)) return false;
  const result = await database().query<{ lifeos_session_valid: boolean }>(
    "SELECT civilization.lifeos_session_valid($1,$2)",
    [id, digest(sid)]
  );
  return result.rows[0]?.lifeos_session_valid === true;
}

export function authorizedExchange(request: Request): boolean {
  const secret = process.env.LIFEOS_HANDOFF_EXCHANGE_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || secret.length < 32 || !header.startsWith("Bearer ")) return false;
  const actual = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function configuredPortalOrigin(): string | null {
  const raw = process.env.LIFEOS_PORTAL_ORIGIN;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return (url.protocol === "https:" || local) && url.origin === raw && !url.username && !url.password ? url.origin : null;
  } catch { return null; }
}
