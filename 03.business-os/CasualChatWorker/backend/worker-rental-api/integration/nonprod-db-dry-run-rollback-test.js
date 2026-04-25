const { getBackendRuntimeConfig, assertCanStartBackend } = require("../backend/worker-rental-api/runtime/backend-runtime-config");
const { createPostgresWorkerRentalRepository } = require("../backend/worker-rental-api/repositories/postgres-worker-rental-repository");
const txService = require("../backend/worker-rental-api/transactions/confirm-rental-transaction-service");

async function main() {
  const config = getBackendRuntimeConfig(process.env);

  if (config.mode !== "nonprod_db_dry_run") {
    throw new Error("Set CCW_BACKEND_MODE=nonprod_db_dry_run to run this dry-run.");
  }

  assertCanStartBackend(config);

  let pg;
  try {
    pg = require("pg");
  } catch (_error) {
    throw new Error("pg package is required for non-production DB dry-run.");
  }

  const pool = new pg.Pool({
    connectionString: process.env.PERSONA_DATABASE_URL
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rollbackOnlyPool = {
      query: (...args) => client.query(...args),
      connect: async () => ({
        query: (...args) => client.query(...args),
        release: () => {}
      })
    };

    const repository = createPostgresWorkerRentalRepository(rollbackOnlyPool);
    const userId = `00000000-0000-0000-0000-000000000001`;

    const quote = await txService.quoteRental({
      repository,
      quoteId: `quote-dry-run-${Date.now()}`,
      payload: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        user_id: userId,
        worker_owner_schema: "aiworker",
        worker_id: "lover-ren",
        worker_type: "Lover",
        rental_unit_kind: "minute",
        rental_unit_count: 90,
        requested_entitlement_count: 2
      }
    });

    if (quote.final_price_jpy !== 500) {
      throw new Error(`Unexpected quote final price: ${quote.final_price_jpy}`);
    }

    console.log("NONPROD DB DRY RUN QUOTE PASS");
    console.log(JSON.stringify({
      app_code: quote.app_code,
      service_code: quote.service_code,
      rental_unit_count: quote.rental_unit_count,
      final_price_jpy: quote.final_price_jpy
    }));

    await client.query("ROLLBACK");
    console.log("ROLLBACK DONE");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_rollbackError) {
      // ignore
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
