window.CCW_MOCK_API = (() => {
  const storageKey = "ccw_state_v1";

  const defaultState = {
    freeTicketBalance: {
      targetMonth: "current",
      grantedTicketCount: 2,
      remainingTicketCount: 2,
      minutesPerTicket: 30,
      carryoverEnabled: false
    },
    history: []
  };

  const workers = [
    {
      aiWorkerId: "friend-haruka",
      displayName: "ハルカ",
      workerType: "Friend",
      seriesCode: "FRIEND_BASIC",
      personalityCode: "calm",
      profileSummary: "落ち着いた友達タイプ。今日の出来事や趣味の話をゆっくり聞きます。",
      safetySummary: "低圧な会話。専門判断や個人情報要求はしません。",
      greeting: "おつかれさま。今日はどんな話をしよっか？"
    },
    {
      aiWorkerId: "friend-sora",
      displayName: "ソラ",
      workerType: "Friend",
      seriesCode: "FRIEND_LIGHT",
      personalityCode: "cheerful",
      profileSummary: "明るい友達タイプ。食べ物、ゲーム、季節の話題が得意です。",
      safetySummary: "気軽な雑談向け。依存誘導や外部実行はしません。",
      greeting: "やっほー。ちょっと気分転換していこう。"
    },
    {
      aiWorkerId: "lover-ren",
      displayName: "レン",
      workerType: "Lover",
      seriesCode: "LOVER_SAFE",
      personalityCode: "gentle",
      profileSummary: "やさしい恋人風AIワーカー。甘めの会話と気遣いが得意です。",
      safetySummary: "擬似恋人型。現実の交際、監視、束縛、性的サービス化はしません。",
      greeting: "来てくれてうれしいよ。契約時間のあいだ、ゆっくり甘やかすね。"
    },
    {
      aiWorkerId: "lover-mio",
      displayName: "ミオ",
      workerType: "Lover",
      seriesCode: "LOVER_DATE",
      personalityCode: "sweet",
      profileSummary: "デート風シチュエーションが得意な恋人風AIワーカーです。",
      safetySummary: "レンタル彼氏/彼女風の安全な演技。現実の関係とは区別します。",
      greeting: "待ってたよ。今日は小さなデートみたいに話そっか。"
    }
  ];

  function loadState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return structuredClone(defaultState);

    try {
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultState),
        ...parsed
      };
    } catch (_error) {
      return structuredClone(defaultState);
    }
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function listWorkers(workerTypeFilter = "all") {
    if (workerTypeFilter === "all") return Promise.resolve(workers);
    return Promise.resolve(workers.filter((worker) => worker.workerType === workerTypeFilter));
  }

  function getWorkerDetail(aiWorkerId) {
    return Promise.resolve(workers.find((worker) => worker.aiWorkerId === aiWorkerId) || null);
  }

  function getFreeTicketBalance() {
    const state = loadState();
    return Promise.resolve(state.freeTicketBalance);
  }

  function quoteContract({ durationMinutes, applyTickets }) {
    const state = loadState();
    const quote = window.CCW_DOMAIN.calculateQuote(
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
    const remaining = Math.max(0, state.freeTicketBalance.remainingTicketCount - quote.appliedFreeTicketCount);

    state.freeTicketBalance.remainingTicketCount = remaining;

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

    state.activeContract = contract;
    state.history.unshift(contract);
    saveState(state);

    return Promise.resolve(contract);
  }

  function updateContractEnded(contractId) {
    const state = loadState();
    if (state.activeContract && state.activeContract.contractId === contractId) {
      state.activeContract.status = "ended";
      state.activeContract.endedAt = new Date().toISOString();
    }

    state.history = state.history.map((item) => {
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
    const state = loadState();
    state.history = [];
    delete state.activeContract;
    state.freeTicketBalance = structuredClone(defaultState.freeTicketBalance);
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
