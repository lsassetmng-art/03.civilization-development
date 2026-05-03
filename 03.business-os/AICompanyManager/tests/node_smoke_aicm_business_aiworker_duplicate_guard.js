global.fetch = function (url, options) {
  const body = options && options.body ? JSON.parse(options.body) : {};

  if (String(url).indexOf("/duplicate-guard") >= 0) {
    const allowed = body.role_code === "Worker" ? true : false;
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        ok: true,
        allowed,
        reason: allowed ? "multi_slot_role_allowed" : "duplicate_single_slot_role_blocked",
        role_code: body.role_code,
        target_level_code: body.target_level_code,
        active_count: allowed ? 3 : 1
      })
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({
      ok: false,
      error: "not_found"
    })
  });
};

const guard = require("../assets/js/aicm-business-aiworker-duplicate-guard.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const presidentDraft = guard.buildSmokeDraft("President");
  const presidentPayload = guard.buildGuardPayloadFromDraft(presidentDraft);

  assertOk(presidentPayload.role_code === "President", "president payload role mismatch");
  assertOk(presidentPayload.target_level_code === "company", "president target mismatch");

  const presidentValidation = guard.validateGuardPayload(presidentPayload);
  assertOk(presidentValidation.ok === true, "president validation should pass");

  const presidentGuard = await guard.checkDuplicateGuard(presidentPayload, {
    apiBaseUrl: "http://127.0.0.1:8797"
  });

  assertOk(presidentGuard.ok === true, "president guard request should pass");
  assertOk(presidentGuard.allowed === false, "president duplicate should be blocked");

  const blocked = guard.buildBlockedResult(presidentDraft, presidentGuard);
  assertOk(blocked.blocked === true, "blocked result should be blocked");
  assertOk(blocked.step === "duplicate_guard", "blocked step mismatch");

  const workerDraft = guard.buildSmokeDraft("Worker");
  const workerPayload = guard.buildGuardPayloadFromDraft(workerDraft);
  const workerGuard = await guard.checkDuplicateGuard(workerPayload, {
    apiBaseUrl: "http://127.0.0.1:8797"
  });

  assertOk(workerGuard.ok === true, "worker guard request should pass");
  assertOk(workerGuard.allowed === true, "worker duplicate should be allowed");

  const invalid = guard.validateGuardPayload({
    company_id: "",
    role_code: "President",
    target_level_code: "company"
  });

  assertOk(invalid.ok === false, "invalid payload should fail");

  console.log("AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
