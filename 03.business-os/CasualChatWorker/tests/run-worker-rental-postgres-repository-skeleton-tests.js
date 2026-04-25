const { createPostgresWorkerRentalRepository } = require("../backend/worker-rental-api/repositories/postgres-worker-rental-repository");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createMockPool() {
  const calls = [];

  function makeResult(rows) {
    return { rows };
  }

  const client = {
    calls,
    async query(sql, params) {
      calls.push({ sql, params, client: true });

      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
        return makeResult([]);
      }

      if (sql.includes("v_worker_rental_monthly_free_ticket_rule")) {
        return makeResult([{
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          monthly_free_ticket_quantity: 2,
          monthly_free_ticket_source_rule: "shortest_contract_duration",
          monthly_free_ticket_unit_kind: "minute",
          monthly_free_ticket_unit_count: 30,
          free_ticket_minutes_total: 60,
          monthly_free_ticket_carryover_enabled: false
        }]);
      }

      if (sql.includes("insert into business.worker_rental_entitlement_grant")) {
        return makeResult([{ entitlement_grant_id: "grant-1" }]);
      }

      if (sql.includes("insert into business.worker_rental_entitlement_balance")) {
        return makeResult([{
          entitlement_balance_id: "balance-1",
          entitlement_grant_id: "grant-1",
          remaining_quantity: 2,
          entitlement_unit_count: 30
        }]);
      }

      if (sql.includes("from business.worker_rental_entitlement_balance")) {
        return makeResult([{
          entitlement_balance_id: "balance-1",
          entitlement_grant_id: "grant-1",
          remaining_quantity: 2,
          entitlement_unit_count: 30
        }]);
      }

      if (sql.includes("insert into business.worker_rental_contract")) {
        return makeResult([{
          rental_contract_id: "contract-1",
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          user_id: params[2],
          worker_owner_schema: params[3],
          worker_id: params[4],
          worker_type: params[5],
          rental_unit_kind: params[6],
          rental_unit_count: params[7],
          rental_total_minutes: params[7],
          base_price_jpy: params[8],
          applied_entitlement_count: params[9],
          free_unit_count: params[10],
          paid_unit_count: params[11],
          final_price_jpy: params[12],
          contract_status: "confirmed"
        }]);
      }

      if (sql.includes("insert into business.worker_rental_period")) {
        return makeResult([{
          rental_period_id: "period-1",
          rental_contract_id: "contract-1"
        }]);
      }

      if (sql.includes("insert into business.worker_rental_payment_intent")) {
        return makeResult([{
          rental_payment_intent_id: "payment-1"
        }]);
      }

      if (sql.includes("insert into business.worker_rental_entitlement_usage")) {
        return makeResult([{
          entitlement_usage_id: "usage-1"
        }]);
      }

      if (sql.includes("update business.worker_rental_entitlement_balance")) {
        return makeResult([{
          entitlement_balance_id: "balance-1",
          remaining_quantity: 0,
          entitlement_unit_count: 30
        }]);
      }

      return makeResult([]);
    },
    release() {
      calls.push({ release: true });
    }
  };

  const pool = {
    calls,
    async query(sql, params) {
      calls.push({ sql, params, pool: true });

      if (sql.includes("v_worker_rental_service_catalog_active")) {
        return makeResult([{
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          minimum_contract_unit_count: 30,
          app_max_contract_unit_count: 120
        }]);
      }

      if (sql.includes("v_worker_rental_monthly_free_ticket_rule")) {
        return makeResult([{
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          monthly_free_ticket_quantity: 2,
          monthly_free_ticket_unit_count: 30
        }]);
      }

      if (sql.includes("v_worker_rental_price_catalog_active")) {
        return makeResult([{
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          rental_unit_kind: "minute",
          rental_unit_count: Number(params[3]),
          base_price_jpy: Number(params[3]) / 30 * 500,
          price_version: "v1",
          currency_code: "JPY",
          is_active: true
        }]);
      }

      if (sql.includes("v_worker_rental_entitlement_balance_active")) {
        return makeResult([{
          app_code: "CasualChatWorker",
          service_code: "casual_chat_worker",
          remaining_quantity: 2,
          entitlement_unit_count: 30
        }]);
      }

      return makeResult([]);
    },
    async connect() {
      calls.push({ connect: true });
      return client;
    }
  };

  return pool;
}

async function main() {
  const pool = createMockPool();
  const repo = createPostgresWorkerRentalRepository(pool);

  const service = await repo.findServiceCatalog("CasualChatWorker", "casual_chat_worker");
  assert(service.app_code === "CasualChatWorker", "service catalog mismatch");

  const rule = await repo.findMonthlyFreeTicketRule("CasualChatWorker", "casual_chat_worker");
  assert(rule.monthly_free_ticket_unit_count === 30, "ticket unit mismatch");

  const price = await repo.findPriceRow("CasualChatWorker", "casual_chat_worker", "minute", 90);
  assert(price.base_price_jpy === 1500, "price mismatch");

  const balance = await repo.findEntitlementBalance("CasualChatWorker", "casual_chat_worker", "user-1", "current");
  assert(balance.remaining_quantity === 2, "balance mismatch");

  const txResult = await repo.createConfirmedRentalTransaction({
    payload: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: "user-1",
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      locale: "ja"
    },
    quote: {
      base_price_jpy: 1500,
      applied_entitlement_count: 2,
      free_unit_count: 60,
      paid_unit_count: 30,
      final_price_jpy: 500,
      price_version: "v1"
    }
  });

  assert(txResult.contract.rental_contract_id === "contract-1", "contract insert mismatch");
  assert(txResult.period.rental_period_id === "period-1", "period insert mismatch");
  assert(txResult.balance.remaining_quantity === 0, "balance update mismatch");
  assert(pool.calls.some((call) => call.sql === "BEGIN"), "BEGIN missing");
  assert(pool.calls.some((call) => call.sql === "COMMIT"), "COMMIT missing");

  console.log("PostgreSQL repository skeleton test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
