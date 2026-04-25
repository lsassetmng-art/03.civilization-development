(function runCasualChatWorkerSmokeTest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  assert(Boolean(window.CCW_DOMAIN), "CCW_DOMAIN missing");
  assert(Boolean(window.CCW_MOCK_API), "CCW_MOCK_API missing");

  const quote30 = window.CCW_DOMAIN.calculateQuote(30, 2, true);
  assert(quote30.finalPriceJpy === 0, "30min with ticket should be free");

  const quote90 = window.CCW_DOMAIN.calculateQuote(90, 2, true);
  assert(quote90.finalPriceJpy === 500, "90min with 2 tickets should be 500 JPY");

  const quote120 = window.CCW_DOMAIN.calculateQuote(120, 2, true);
  assert(quote120.finalPriceJpy === 1000, "120min with 2 tickets should be 1000 JPY");

  console.log("CasualChatWorker smoke test PASS");
})();
