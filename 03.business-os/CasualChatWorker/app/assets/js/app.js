(() => {
  const state = {
    filter: "all",
    selectedWorker: null,
    selectedDuration: 30,
    quote: null,
    activeContract: null,
    remainingSeconds: 0,
    timerId: null,
    messageCount: 0
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function showScreen(screenName) {
    $$(".screen").forEach((screen) => screen.classList.remove("is-active"));
    $$(".tab").forEach((tab) => tab.classList.remove("is-active"));

    $(`#screen-${screenName}`).classList.add("is-active");
    const tab = $(`.tab[data-screen="${screenName}"]`);
    if (tab) tab.classList.add("is-active");

    if (screenName === "history") renderHistory();
    if (screenName === "contract") refreshQuote();
  }

  function updateTicketPill(balance) {
    $("#ticketPill").textContent = `無料チケット ${balance.remainingTicketCount}/${balance.grantedTicketCount}枚`;
  }

  async function loadTicketBalance() {
    const balance = await window.CCW_MOCK_API.getFreeTicketBalance();
    updateTicketPill(balance);
    return balance;
  }

  async function renderWorkers() {
    const workers = await window.CCW_MOCK_API.listWorkers(state.filter);
    const grid = $("#workerGrid");

    grid.innerHTML = workers.map((worker) => {
      const badgeClass = worker.workerType === "Lover" ? "lover" : "friend";
      return `
        <article class="card worker-card">
          <span class="badge ${badgeClass}">${worker.workerType}</span>
          <h3>${worker.displayName}</h3>
          <p class="muted">${worker.profileSummary}</p>
          <p class="muted">${worker.safetySummary}</p>
          <div class="worker-actions">
            <button class="primary" data-select-worker="${worker.aiWorkerId}">選択する</button>
          </div>
        </article>
      `;
    }).join("");

    $$("[data-select-worker]").forEach((button) => {
      button.addEventListener("click", async () => {
        const worker = await window.CCW_MOCK_API.getWorkerDetail(button.dataset.selectWorker);
        selectWorker(worker);
      });
    });
  }

  function selectWorker(worker) {
    state.selectedWorker = worker;
    $("#selectedWorkerName").textContent = worker.displayName;
    $("#selectedWorkerType").textContent = `${worker.workerType} / ${worker.seriesCode}`;
    $("#selectedWorkerDescription").textContent = worker.profileSummary;

    if (worker.workerType === "Lover") {
      $("#safetyNotice").textContent = "Lover安全境界: 擬似恋人型AIワーカーです。現実の交際関係、監視、脅し、依存誘導、性的サービス化は行いません。";
    } else {
      $("#safetyNotice").textContent = "Friend安全境界: 気軽な雑談向けです。専門判断、外部実行、個人情報要求、依存誘導は行いません。";
    }

    showScreen("contract");
  }

  function renderDurations() {
    const grid = $("#durationGrid");

    grid.innerHTML = window.CCW_DOMAIN.durations.map((item) => {
      const active = item.minutes === state.selectedDuration ? "is-active" : "";
      return `
        <button class="duration-button ${active}" data-duration="${item.minutes}">
          <strong>${item.minutes}分</strong><br>
          <span>${window.CCW_DOMAIN.formatJpy(item.priceJpy)}</span>
        </button>
      `;
    }).join("");

    $$("[data-duration]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedDuration = Number(button.dataset.duration);
        renderDurations();
        refreshQuote();
      });
    });
  }

  async function refreshQuote() {
    const applyTickets = $("#applyTickets") ? $("#applyTickets").checked : true;
    const quote = await window.CCW_MOCK_API.quoteContract({
      durationMinutes: state.selectedDuration,
      applyTickets
    });

    state.quote = quote;

    $("#quoteBase").textContent = window.CCW_DOMAIN.formatJpy(quote.basePriceJpy);
    $("#quoteTickets").textContent = `${quote.appliedFreeTicketCount}枚`;
    $("#quoteFreeMinutes").textContent = `${quote.freeMinutes}分`;
    $("#quotePaidMinutes").textContent = `${quote.paidMinutes}分`;
    $("#quoteFinal").textContent = window.CCW_DOMAIN.formatJpy(quote.finalPriceJpy);
  }

  async function confirmContract() {
    if (!state.selectedWorker) {
      alert("先にAIワーカーを選択してください。");
      showScreen("workers");
      return;
    }

    if (!state.quote) {
      await refreshQuote();
    }

    const contract = await window.CCW_MOCK_API.confirmContract({
      worker: state.selectedWorker,
      quote: state.quote
    });

    state.activeContract = contract;
    state.remainingSeconds = contract.durationMinutes * 60;
    state.messageCount = 0;

    await loadTicketBalance();
    startChatSession();
    showScreen("chat");
  }

  function startChatSession() {
    clearInterval(state.timerId);

    const worker = state.selectedWorker;
    $("#chatTitle").textContent = `${worker.displayName} / ${worker.workerType}`;
    $("#chatLog").innerHTML = "";

    addMessage("ai", worker.greeting);

    if (worker.workerType === "Lover") {
      addMessage("safety", "これは契約時間内の擬似恋人・レンタル彼氏/彼女風の会話体験です。現実の交際関係ではありません。");
    }

    updateTimer();

    state.timerId = setInterval(() => {
      state.remainingSeconds -= 1;
      updateTimer();

      if (state.remainingSeconds <= 0) {
        endSession("time_expired");
      }
    }, 1000);
  }

  function updateTimer() {
    $("#remainingTimer").textContent = window.CCW_DOMAIN.formatTimer(state.remainingSeconds);
  }

  function addMessage(kind, text) {
    const log = $("#chatLog");
    const div = document.createElement("div");
    div.className = `message ${kind}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function containsUnsafeKeyword(text) {
    return window.CCW_DOMAIN.safety.unsafeKeywords.some((keyword) => text.includes(keyword));
  }

  function generateReply(text) {
    const worker = state.selectedWorker;
    const unsafe = containsUnsafeKeyword(text);

    if (unsafe) {
      return {
        kind: "safety",
        text: worker.workerType === "Lover"
          ? "その方向には進めないよ。ここでは安心できる範囲で、甘めの雑談や今日の話をしよう。"
          : "その内容は扱えないよ。気軽な雑談、趣味、食べ物、季節の話に切り替えよう。"
      };
    }

    if (worker.workerType === "Lover") {
      const replies = [
        "うん、ちゃんと聞いてるよ。今日は少し甘やかしてもいい？",
        "その話、もっと聞きたいな。無理しない範囲で話してね。",
        "いいね。契約時間のあいだは、ゆっくり一緒に過ごそう。",
        "ちょっとデート気分で、次は好きな食べ物の話でもしよっか。"
      ];
      return { kind: "ai", text: replies[state.messageCount % replies.length] };
    }

    const replies = [
      "いいね、それは話しやすいテーマだね。",
      "なるほど。もう少し気軽に聞かせて。",
      "それなら、食べ物とか最近見た動画の話にもつなげられそう。",
      "うんうん。今日は軽めに雑談していこう。"
    ];
    return { kind: "ai", text: replies[state.messageCount % replies.length] };
  }

  function sendMessage() {
    const input = $("#chatInput");
    const text = input.value.trim();

    if (!text) return;
    if (!state.activeContract) {
      alert("先に契約を確定してください。");
      return;
    }

    addMessage("user", text);
    input.value = "";

    const reply = generateReply(text);
    state.messageCount += 1;

    setTimeout(() => {
      addMessage(reply.kind, reply.text);
    }, 250);
  }

  async function endSession(reason) {
    clearInterval(state.timerId);
    state.timerId = null;

    if (state.activeContract) {
      await window.CCW_MOCK_API.updateContractEnded(state.activeContract.contractId);
      addMessage("ai", reason === "time_expired" ? "時間になったよ。今日はここまで。また話したくなったら会いに来てね。" : "セッションを終了しました。また話したくなったら会いに来てください。");
      state.activeContract = null;
    }

    await renderHistory();
  }

  async function renderHistory() {
    const history = await window.CCW_MOCK_API.getHistory();
    const list = $("#historyList");

    if (!history.length) {
      list.innerHTML = `<article class="card"><p class="muted">履歴はまだありません。</p></article>`;
      return;
    }

    list.innerHTML = history.map((item) => {
      return `
        <article class="history-row">
          <div>
            <strong>${item.displayName}</strong><br>
            <span class="muted">${item.workerType} / ${new Date(item.startedAt).toLocaleString("ja-JP")}</span>
          </div>
          <div>${item.durationMinutes}分</div>
          <div>チケット ${item.appliedFreeTicketCount}枚</div>
          <div>${window.CCW_DOMAIN.formatJpy(item.finalPriceJpy)} / ${item.status}</div>
        </article>
      `;
    }).join("");
  }

  async function clearHistory() {
    await window.CCW_MOCK_API.clearHistory();
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
        state.filter = chip.dataset.filter;
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
