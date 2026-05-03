global.AICMBusinessAIWorkerSaveClient = {
  callCount: 0,
  saveDraft: function saveDraft(draft) {
    this.callCount += 1;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          saved: true,
          draft
        });
      }, 50);
    });
  }
};

const guard = require("../assets/js/aicm-business-aiworker-save-double-submit-guard.js");

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  guard.resetForTest();

  const initResult = guard.init();
  assertOk(initResult.ok === true, "init should be ok");
  assertOk(initResult.wrapResult.ok === true, "wrap should be ok");

  const firstPromise = global.AICMBusinessAIWorkerSaveClient.saveDraft({
    id: "first"
  });

  assertOk(guard.isInFlight() === true, "guard should be in flight after first save");

  const secondResult = await global.AICMBusinessAIWorkerSaveClient.saveDraft({
    id: "second"
  });

  assertOk(secondResult.ok === false, "second save should be blocked");
  assertOk(secondResult.blocked === true, "second save should be blocked=true");
  assertOk(secondResult.step === "double_submit_guard", "blocked step mismatch");

  const firstResult = await firstPromise;

  assertOk(firstResult.ok === true, "first save should complete");
  assertOk(guard.isInFlight() === false, "guard should unlock after first save");
  assertOk(global.AICMBusinessAIWorkerSaveClient.callCount === 1, "original save should only be called once before third save");

  const thirdResult = await global.AICMBusinessAIWorkerSaveClient.saveDraft({
    id: "third"
  });

  assertOk(thirdResult.ok === true, "third save should pass after unlock");
  assertOk(global.AICMBusinessAIWorkerSaveClient.callCount === 2, "original save should be called twice total");

  const state = guard.getState();
  assertOk(state.blockedCount === 1, "blocked count should be 1");
  assertOk(state.finishedAt, "finishedAt should be set");

  console.log("AICM_BUSINESS_AIWORKER_SAVE_DOUBLE_SUBMIT_GUARD_SMOKE_PASS=true");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
