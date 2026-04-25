window.CCW_CONTRACT_SERVICE = {
  defaultUserId: "00000000-0000-0000-0000-000000000001",

  async getEntitlementDisplay() {
    return window.CCW_WORKER_RENTAL_REPOSITORY.getFreeTicketBalance(this.defaultUserId);
  },

  async quoteSelectedWorker(worker, durationMinutes) {
    const balance = await this.getEntitlementDisplay();
    const requestedFreeTicketCount = Math.min(
      balance.remaining_quantity || 0,
      Math.floor(durationMinutes / 30),
      2
    );

    return window.CCW_WORKER_RENTAL_REPOSITORY.quoteContract({
      userId: this.defaultUserId,
      worker,
      durationMinutes,
      requestedFreeTicketCount
    });
  },

  async confirmSelectedWorker(worker, quote) {
    return window.CCW_WORKER_RENTAL_REPOSITORY.confirmContract({
      userId: this.defaultUserId,
      quoteId: quote.quote_id || `mock-quote-${Date.now()}`,
      worker,
      quote
    });
  }
};
