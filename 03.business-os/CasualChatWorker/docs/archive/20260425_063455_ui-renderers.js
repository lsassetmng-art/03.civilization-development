window.CCW_UI_RENDERERS = {
  workerCard(worker) {
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
  },

  durationButton(item, selectedDuration) {
    const active = item.minutes === selectedDuration ? "is-active" : "";
    return `
      <button class="duration-button ${active}" data-duration="${item.minutes}">
        <strong>${item.minutes}分</strong><br>
        <span>${window.CCW_PRICING_DOMAIN.formatJpy(item.priceJpy)}</span>
      </button>
    `;
  },

  historyRow(item) {
    return `
      <article class="history-row">
        <div>
          <strong>${item.displayName}</strong><br>
          <span class="muted">${item.workerType} / ${new Date(item.startedAt).toLocaleString("ja-JP")}</span>
        </div>
        <div>${item.durationMinutes}分</div>
        <div>チケット ${item.appliedFreeTicketCount}枚</div>
        <div>${window.CCW_PRICING_DOMAIN.formatJpy(item.finalPriceJpy)} / ${item.status}</div>
      </article>
    `;
  },

  message(kind, text) {
    const div = document.createElement("div");
    div.className = `message ${kind}`;
    div.textContent = text;
    return div;
  }
};
