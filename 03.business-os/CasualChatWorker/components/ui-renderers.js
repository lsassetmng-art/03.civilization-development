window.CCW_UI_RENDERERS = {
  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  renderTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return "";
    return `
      <div class="style-tags">
        ${tags.map((tag) => `<span>${this.escapeHtml(tag)}</span>`).join("")}
      </div>
    `;
  },

  renderSeriesMiniPanel(seriesTendency) {
    if (!seriesTendency) return "";

    return `
      <div class="series-mini-panel">
        <strong>${this.escapeHtml(seriesTendency.displayNameJa || seriesTendency.seriesCode)}</strong>
        <div class="series-axis-row">
          <span>積極性: ${this.escapeHtml(seriesTendency.initiativeLabelJa || seriesTendency.initiative)}</span>
          <span>影響度: ${this.escapeHtml(seriesTendency.userInfluenceLabelJa || seriesTendency.userInfluence)}</span>
          <span>制限: ${this.escapeHtml(seriesTendency.actionRestrictionLabelJa || seriesTendency.actionRestriction)}</span>
        </div>
      </div>
    `;
  },

  renderLoversStylePanel(styleCard) {
    if (!styleCard) return "";

    const strongNotice = styleCard.requires_strong_safety_notice_flag
      ? `<div class="strong-notice">強めの安全注意: この個体はキャラ演技が強めです。監視・脅し・依存誘導・性的サービス化には進めません。</div>`
      : "";

    return `
      <div class="lovers-style-panel">
        <strong>${this.escapeHtml(styleCard.app_display_name_ja)}</strong>
        <p>${this.escapeHtml(styleCard.app_display_summary_ja)}</p>
        ${this.renderTags(styleCard.app_display_tags_ja)}
        ${strongNotice}
      </div>
    `;
  },

  workerCard(worker) {
    const badgeClass = worker.workerType === "Lover" ? "lover" : "friend";
    const seriesPanel = this.renderSeriesMiniPanel(worker.seriesTendency);
    const stylePanel = this.renderLoversStylePanel(worker.loversStyleCard);
    const strongBadge = worker.loversStyleCard && worker.loversStyleCard.requires_strong_safety_notice_flag
      ? `<span class="badge danger">強安全注意</span>`
      : "";

    return `
      <article class="card worker-card">
        <div class="worker-card-top">
          <span class="badge ${badgeClass}">${this.escapeHtml(worker.workerType)}</span>
          ${strongBadge}
        </div>
        <h3>${this.escapeHtml(worker.displayName)}</h3>
        <p class="muted">${this.escapeHtml(worker.profileSummary)}</p>
        <p class="muted">${this.escapeHtml(worker.personalityFeatureSummary || "")}</p>
        ${seriesPanel}
        ${stylePanel}
        <p class="muted">${this.escapeHtml(worker.safetySummary)}</p>
        <div class="worker-actions">
          <button class="primary" data-select-worker="${this.escapeHtml(worker.aiWorkerId)}">選択する</button>
        </div>
      </article>
    `;
  },

  selectedWorkerDetail(worker) {
    if (!worker) return "";

    const seriesPanel = this.renderSeriesMiniPanel(worker.seriesTendency);
    const stylePanel = this.renderLoversStylePanel(worker.loversStyleCard);

    return `
      <div class="selected-worker-detail">
        <p>${this.escapeHtml(worker.profileSummary)}</p>
        <p>${this.escapeHtml(worker.personalityFeatureSummary || "")}</p>
        ${seriesPanel}
        ${stylePanel}
      </div>
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
          <strong>${this.escapeHtml(item.displayName)}</strong><br>
          <span class="muted">${this.escapeHtml(item.workerType)} / ${new Date(item.startedAt).toLocaleString("ja-JP")}</span>
        </div>
        <div>${item.durationMinutes}分</div>
        <div>チケット ${item.appliedFreeTicketCount}枚</div>
        <div>${window.CCW_PRICING_DOMAIN.formatJpy(item.finalPriceJpy)} / ${this.escapeHtml(item.status)}</div>
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
