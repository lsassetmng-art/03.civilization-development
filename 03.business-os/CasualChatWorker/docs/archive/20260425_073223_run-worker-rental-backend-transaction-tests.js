const { createInMemoryWorkerRentalRepository } = require("../backend/worker-rental-api/repositories/in-memory-worker-rental-repository");
const txService = require("../backend/worker-rental-api/transactions/confirm-rental-transaction-service");
const routes = require("../backend/worker-rental-api/routes/worker-rental-routes-v2");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const repository = createInMemoryWorkerRentalRepository();
  const userId = "00000000-0000-0000-0000-000000000001";

  const balance = await txService.issueMonthlyFreeTicketIfNeeded({
    repository,
    appCode: "CasualChatWorker",
    serviceCode: "casual_chat_worker",
    userId,
    grantPeriod: "current"
  });

  assert(balance.remaining_quantity === 2, "initial ticket remaining should be 2");
  assert(balance.entitlement_unit_count === 30, "ticket unit count should be 30");

  const quote = await txService.quoteRental({
    repository,
    quoteId: "quote-test-90",
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

  assert(quote.base_price_jpy === 1500, "90 min base should be 1500");
  assert(quote.applied_entitlement_count === 2, "should apply two tickets");
  assert(quote.free_unit_count === 60, "free unit count should be 60");
  assert(quote.paid_unit_count === 30, "paid unit count should be 30");
  assert(quote.final_price_jpy === 500, "final price should be 500");

  const confirm = await txService.confirmRental({
    repository,
    context: {
      actorType: "member",
      actorUserId: userId
    },
    quoteId: "quote-test-90",
    payload: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: userId,
      quote_id: "quote-test-90",
      worker_owner_schema: "aiworker",
      worker_id: "lover-ren",
      worker_type: "Lover",
      rental_unit_kind: "minute",
      rental_unit_count: 90,
      apply_entitlement_count: 2,
      confirmed_price_jpy: 500
    }
  });

  assert(confirm.status === "confirmed", "confirm status should be confirmed");
  assert(confirm.final_price_jpy === 500, "confirm final price should be 500");
  assert(confirm.remaining_entitlement_count === 0, "remaining tickets should be 0");

  assert(repository.state.contracts.length === 1, "contract should be inserted");
  assert(repository.state.periods.length === 1, "period should be inserted");
  assert(repository.state.payments.length === 1, "payment should be inserted");
  assert(repository.state.entitlementUsages.length === 1, "entitlement usage should be inserted");
  assert(repository.state.statusHistory.length === 1, "status history should be inserted");

  let mismatchBlocked = false;
  try {
    await txService.confirmRental({
      repository,
      context: {
        actorType: "member",
        actorUserId: userId
      },
      quoteId: "quote-bad",
      payload: {
        app_code: "CasualChatWorker",
        service_code: "casual_chat_worker",
        user_id: userId,
        quote_id: "quote-bad",
        worker_owner_schema: "aiworker",
        worker_id: "lover-ren",
        worker_type: "Lover",
        rental_unit_kind: "minute",
        rental_unit_count: 150,
        apply_entitlement_count: 0,
        confirmed_price_jpy: 2500
      }
    });
  } catch (_error) {
    mismatchBlocked = true;
  }

  assert(mismatchBlocked === true, "150 minutes should be blocked");

  const repository2 = createInMemoryWorkerRentalRepository();
  const routeResult = await routes.postConfirmWithTransaction({
    body: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      user_id: userId,
      quote_id: "quote-route-60",
      worker_owner_schema: "aiworker",
      worker_id: "friend-sora",
      worker_type: "Friend",
      rental_unit_kind: "minute",
      rental_unit_count: 60,
      apply_entitlement_count: 2,
      confirmed_price_jpy: 0
    }
  }, {
    workerRentalRepository: repository2,
    context: {
      actorType: "member",
      actorUserId: userId
    }
  });

  assert(routeResult.status === "confirmed", "route confirm should be confirmed");
  assert(routeResult.final_price_jpy === 0, "60 min with two tickets should be free");

  console.log("WorkerRental backend transaction preparation test PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
