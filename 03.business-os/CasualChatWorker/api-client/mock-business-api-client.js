window.CCW_BUSINESS_API_CLIENT = (() => {
  const storageKey = "ccw_state_v2";

  function defaultState() {
    return {
      freeTicketBalance: window.CCW_TICKET_DOMAIN.createDefaultBalance(),
      history: []
    };
  }

  function loadState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultState();

    try {
      return {
        ...defaultState(),
        ...JSON.parse(raw)
      };
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function listWorkers(workerTypeFilter) {
    return Promise.resolve(window.CCW_AIWORKER_REFERENCE.list(workerTypeFilter));
  }

  function getWorkerDetail(aiWorkerId) {
    return Promise.resolve(window.CCW_AIWORKER_REFERENCE.find(aiWorkerId));
  }

  function getFreeTicketBalance() {
    const state = loadState();
    return Promise.resolve(state.freeTicketBalance);
  }

  function quoteContract({ durationMinutes, applyTickets }) {
    const state = loadState();
    const quote = window.CCW_PRICING_DOMAIN.calculateQuote(
      durationMinutes,
      state.freeTicketBalance.remainingTicketCount,
      applyTickets
    );
    return Promise.resolve(quote);
  }

  function confirmContract({ worker, quote }) {
    const state = loadState();
    const now = new Date();
    const contractId = `contract-${now.getTime()}`;
    const sessionId = `session-${now.getTime()}`;
    const nextBalance = window.CCW_TICKET_DOMAIN.applyUsage(state.freeTicketBalance, quote.appliedFreeTicketCount);

    const contract = {
      contractId,
      sessionId,
      aiWorkerId: worker.aiWorkerId,
      displayName: worker.displayName,
      workerType: worker.workerType,
      durationMinutes: quote.durationMinutes,
      basePriceJpy: quote.basePriceJpy,
      appliedFreeTicketCount: quote.appliedFreeTicketCount,
      freeMinutes: quote.freeMinutes,
      paidMinutes: quote.paidMinutes,
      finalPriceJpy: quote.finalPriceJpy,
      startedAt: now.toISOString(),
      status: "active"
    };

    state.freeTicketBalance = nextBalance;
    state.activeContract = contract;
    state.history = [contract, ...(state.history || [])];
    saveState(state);

    return Promise.resolve(contract);
  }

  function updateContractEnded(contractId) {
    const state = loadState();

    if (state.activeContract && state.activeContract.contractId === contractId) {
      state.activeContract.status = "ended";
      state.activeContract.endedAt = new Date().toISOString();
    }

    state.history = (state.history || []).map((item) => {
      if (item.contractId !== contractId) return item;
      return {
        ...item,
        status: "ended",
        endedAt: new Date().toISOString()
      };
    });

    saveState(state);
    return Promise.resolve(true);
  }

  function getHistory() {
    const state = loadState();
    return Promise.resolve(state.history || []);
  }

  function clearHistory() {
    const state = defaultState();
    saveState(state);
    return Promise.resolve(true);
  }

  return {
    listWorkers,
    getWorkerDetail,
    getFreeTicketBalance,
    quoteContract,
    confirmContract,
    updateContractEnded,
    getHistory,
    clearHistory
  };
})();
