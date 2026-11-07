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
export async function issueLifeosCode(id: string, origin: string, state: unknown, challenge: unknown): Promise<string | null> {
  if (!opaque(state) || !opaque(challenge) || !id || id.length > 256) return null;
  const code = randomBytes(32).toString("base64url");
  const result = await database().query<{ lifeos_handoff_issue: boolean }>(
    "SELECT civilization.lifeos_handoff_issue($1,$2,$3,$4,$5)",
    [digest(code), id, origin, challenge, digest(state)]
  );
  return result.rows[0]?.lifeos_handoff_issue === true ? code : null;
}
export async function consumeLifeosCode(code: unknown, origin: string, state: unknown, verifier: unknown): Promise<string | null> {
  if (!opaque(code) || !opaque(state) || !opaque(verifier)) return null;
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const result = await database().query<{ civilization_id: string }>(
    "SELECT civilization_id FROM civilization.lifeos_handoff_consume($1,$2,$3,$4)",
    [digest(code), origin, challenge, digest(state)]
  );
  return result.rows.length === 1 ? result.rows[0].civilization_id : null;
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
