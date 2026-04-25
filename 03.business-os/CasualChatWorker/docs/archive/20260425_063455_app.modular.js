(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function getState() {
    return window.CCW_APP_STATE.get();
  }

  function setState(patch) {
    return window.CCW_APP_STATE.set(patch);
  }

  function showScreen(screenName) {
    window.CCW_SCREEN_ROUTER.show(screenName);
    if (screenName === "history") renderHistory();
    if (screenName === "contract") refreshQuote();
  }

  function updateTicketPill(balance) {
    $("#ticketPill").textContent = window.CCW_TICKET_DOMAIN.getDisplayText(balance);
  }

  async function loadTicketBalance() {
    const balance = await window.CCW_BUSINESS_API_CLIENT.getFreeTicketBalance();
    updateTicketPill(balance);
    return balance;
  }

  async function renderWorkers() {
    const state = getState();
    const workers = await window.CCW_BUSINESS_API_CLIENT.listWorkers(state.filter);
    $("#workerGrid").innerHTML = workers.map((worker) => window.CCW_UI_RENDERERS.workerCard(worker)).join("");

    $$("[data-select-worker]").forEach((button) => {
      button.addEventListener("click", async () => {
        const worker = await window.CCW_BUSINESS_API_CLIENT.getWorkerDetail(button.dataset.selectWorker);
        selectWorker(worker);
      });
    });
  }

  function selectWorker(worker) {
    setState({ selectedWorker: worker });
    $("#selectedWorkerName").textContent = worker.displayName;
    $("#selectedWorkerType").textContent = `${worker.workerType} / ${worker.seriesCode}`;
    $("#selectedWorkerDescription").textContent = worker.profileSummary;
    $("#safetyNotice").textContent = window.CCW_SAFETY_POLICY.getNotice(worker.workerType);
    showScreen("contract");
  }

  function renderDurations() {
    const state = getState();
    $("#durationGrid").innerHTML = window.CCW_DOMAIN_CONSTANTS.durations
      .map((item) => window.CCW_UI_RENDERERS.durationButton(item, state.selectedDuration))
      .join("");

    $$("[data-duration]").forEach((button) => {
      button.addEventListener("click", () => {
        setState({ selectedDuration: Number(button.dataset.duration) });
        renderDurations();
        refreshQuote();
      });
    });
  }

  async function refreshQuote() {
    const state = getState();
    const applyTickets = $("#applyTickets") ? $("#applyTickets").checked : true;
    const quote = await window.CCW_BUSINESS_API_CLIENT.quoteContract({
      durationMinutes: state.selectedDuration,
      applyTickets
    });

    setState({ quote });

    $("#quoteBase").textContent = window.CCW_PRICING_DOMAIN.formatJpy(quote.basePriceJpy);
    $("#quoteTickets").textContent = `${quote.appliedFreeTicketCount}枚`;
    $("#quoteFreeMinutes").textContent = `${quote.freeMinutes}分`;
    $("#quotePaidMinutes").textContent = `${quote.paidMinutes}分`;
    $("#quoteFinal").textContent = window.CCW_PRICING_DOMAIN.formatJpy(quote.finalPriceJpy);
  }

  async function confirmContract() {
    const state = getState();

    if (!state.selectedWorker) {
      alert("先にAIワーカーを選択してください。");
      showScreen("workers");
      return;
    }

    if (!state.quote) {
      await refreshQuote();
    }

    const latestState = getState();
    const contract = await window.CCW_BUSINESS_API_CLIENT.confirmContract({
      worker: latestState.selectedWorker,
      quote: latestState.quote
    });

    setState({
      activeContract: contract,
      remainingSeconds: contract.durationMinutes * 60,
      messageCount: 0
    });

    await loadTicketBalance();
    startChatSession();
    showScreen("chat");
  }

  function startChatSession() {
    const state = getState();
    clearInterval(state.timerId);

    const worker = state.selectedWorker;
    $("#chatTitle").textContent = `${worker.displayName} / ${worker.workerType}`;
    $("#chatLog").innerHTML = "";

    addMessage("ai", worker.greeting);

    if (worker.workerType === "Lover") {
      addMessage("safety", "これは契約時間内の擬似恋人・レンタル彼氏/彼女風の会話体験です。現実の交際関係ではありません。");
    }

    updateTimer();

    const timerId = setInterval(() => {
      const current = getState();
      const nextSeconds = current.remainingSeconds - 1;
      setState({ remainingSeconds: nextSeconds });
      updateTimer();

      if (nextSeconds <= 0) {
        endSession("time_expired");
      }
    }, 1000);

    setState({ timerId });
  }

  function updateTimer() {
    const state = getState();
    $("#remainingTimer").textContent = window.CCW_PRICING_DOMAIN.formatTimer(state.remainingSeconds);
  }

  function addMessage(kind, text) {
    const log = $("#chatLog");
    log.appendChild(window.CCW_UI_RENDERERS.message(kind, text));
    log.scrollTop = log.scrollHeight;
  }

  function generateReply(text) {
    const state = getState();
    const worker = state.selectedWorker;

    if (window.CCW_SAFETY_POLICY.containsUnsafeKeyword(text)) {
      return {
        kind: "safety",
        text: window.CCW_SAFETY_POLICY.getRedirect(worker.workerType)
      };
    }

    const topics = window.CCW_CX_MATERIAL.getTopics(worker.workerType);
    const topic = topics[state.messageCount % topics.length];

    if (worker.workerType === "Lover") {
      return {
        kind: "ai",
        text: `うん、ちゃんと聞いてるよ。次は「${topic}」みたいな安全な話題で、ゆっくり話そ。`
      };
    }

    return {
      kind: "ai",
      text: `いいね。次は「${topic}」の話にもつなげられそう。気軽に話していこう。`
    };
  }

  function sendMessage() {
    const input = $("#chatInput");
    const text = input.value.trim();
    const state = getState();

    if (!text) return;

    if (!state.activeContract) {
      alert("先に契約を確定してください。");
      return;
    }

    addMessage("user", text);
    input.value = "";

    const reply = generateReply(text);
    setState({ messageCount: state.messageCount + 1 });

    setTimeout(() => {
      addMessage(reply.kind, reply.text);
    }, 250);
  }

  async function endSession(reason) {
    const state = getState();
    clearInterval(state.timerId);

    if (state.activeContract) {
      await window.CCW_BUSINESS_API_CLIENT.updateContractEnded(state.activeContract.contractId);
      addMessage("ai", reason === "time_expired" ? "時間になったよ。今日はここまで。また話したくなったら会いに来てね。" : "セッションを終了しました。また話したくなったら会いに来てください。");
      setState({ activeContract: null, timerId: null });
    }

    await renderHistory();
  }

  async function renderHistory() {
    const history = await window.CCW_BUSINESS_API_CLIENT.getHistory();
    const list = $("#historyList");

    if (!history.length) {
      list.innerHTML = `<article class="card"><p class="muted">履歴はまだありません。</p></article>`;
      return;
    }

    list.innerHTML = history.map((item) => window.CCW_UI_RENDERERS.historyRow(item)).join("");
  }

  async function clearHistory() {
    await window.CCW_BUSINESS_API_CLIENT.clearHistory();
    await loadTicketBalance();
    await renderHistory();
  }

  function bindEvents() {
    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => showScreen(tab.dataset.screen));
    });

    $$("[data-go]").forEach((button) => {
      button.addEventListener("click", () => showScreen(button.dataset.go));
    });

    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", async () => {
        $$(".chip").forEach((item) => item.classList.remove("is-active"));
        chip.classList.add("is-active");
        setState({ filter: chip.dataset.filter });
        await renderWorkers();
      });
    });

    $("#applyTickets").addEventListener("change", refreshQuote);
    $("#confirmContract").addEventListener("click", confirmContract);
    $("#sendMessage").addEventListener("click", sendMessage);
    $("#endSession").addEventListener("click", () => endSession("manual"));
    $("#clearHistory").addEventListener("click", clearHistory);

    $("#chatInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") sendMessage();
    });
  }

  async function init() {
    bindEvents();
    renderDurations();
    await loadTicketBalance();
    await renderWorkers();
    await refreshQuote();
    await renderHistory();
  }

  init();
})();
