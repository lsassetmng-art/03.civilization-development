import { createHash } from "crypto";
import { Pool } from "pg";

let pool: Pool | null = null;

export type ReplayConsumptionResult =
  | "consumed"
  | "replayed"
  | "unavailable";

function databasePool(): Pool {
  if (pool) return pool;

  const raw = process.env.PERSONA_DATABASE_URL;

  if (!raw) {
    throw new Error("replay_store_unavailable");
  }

  const url = new URL(raw);

  if (
    !["postgres:", "postgresql:"].includes(url.protocol)
  ) {
    throw new Error("invalid_database_protocol");
  }

  url.searchParams.delete("uselibpqcompat");
  url.searchParams.set("sslmode", "verify-full");

  pool = new Pool({
    connectionString: url.toString(),
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true
  });

  return pool;
}

export async function consumePersonaHandoffCode(
  code: string,
  expiresAtMs: number
): Promise<ReplayConsumptionResult> {
  const codeHash = createHash("sha256")
    .update(code, "utf8")
    .digest("hex");

  if (!Number.isSafeInteger(expiresAtMs)) {
    return "unavailable";
  }

  try {
    const result = await databasePool().query<{
      consumed: boolean;
    }>(
      `SELECT civilization.consume_persona_auth_handoff(
         $1::text,
         $2::timestamptz
       ) AS consumed`,
      [
        codeHash,
        new Date(expiresAtMs).toISOString()
      ]
    );

    return result.rows[0]?.consumed === true
      ? "consumed"
      : "replayed";
  } catch {
    return "unavailable";
  }
}
