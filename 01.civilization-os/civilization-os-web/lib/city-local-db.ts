import {
  Pool,
  type PoolClient
} from "pg";

const DATABASE_ENV =
  "PERSONA_DATABASE_URL";

const REQUIRED_SSL_MODE =
  "verify-full";

export class CivilizationPersistenceUnavailableError extends Error {
  constructor() {
    super(
      "CivilizationOS persistence is unavailable."
    );

    this.name =
      "CivilizationPersistenceUnavailableError";
  }
}

let pool: Pool | null = null;

function buildConnectionString(): string {
  const raw =
    process.env[DATABASE_ENV];

  if (
    typeof raw !== "string" ||
    raw.trim().length === 0
  ) {
    throw new CivilizationPersistenceUnavailableError();
  }

  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new CivilizationPersistenceUnavailableError();
  }

  if (
    url.protocol !== "postgres:" &&
    url.protocol !== "postgresql:"
  ) {
    throw new CivilizationPersistenceUnavailableError();
  }

  url.searchParams.delete(
    "uselibpqcompat"
  );

  url.searchParams.set(
    "sslmode",
    REQUIRED_SSL_MODE
  );

  return url.toString();
}

function civilizationPool(): Pool {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      connectionString:
        buildConnectionString(),
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true
    });

    return pool;
  } catch {
    throw new CivilizationPersistenceUnavailableError();
  }
}

export async function withCivilizationReadTransaction<T>(
  run: (
    client: PoolClient
  ) => Promise<T>
): Promise<T> {
  let client: PoolClient | null = null;

  try {
    client =
      await civilizationPool().connect();

    await client.query(
      "BEGIN READ ONLY"
    );

    await client.query(
      "SET LOCAL statement_timeout = '5000ms'"
    );

    const value =
      await run(client);

    await client.query(
      "COMMIT"
    );

    return value;
  } catch {
    if (client) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {
        // Fail closed. Do not expose backend details.
      }
    }

    throw new CivilizationPersistenceUnavailableError();
  } finally {
    client?.release();
  }
}
