window.CCW_PRICING_DOMAIN = {
  calculateBasePrice(durationMinutes) {
    return durationMinutes / window.CCW_DOMAIN_CONSTANTS.priceUnitMinutes * window.CCW_DOMAIN_CONSTANTS.priceUnitJpy;
  },

  calculateQuote(durationMinutes, remainingTickets, applyTickets) {
    const basePriceJpy = this.calculateBasePrice(durationMinutes);
    const maxTicketsByDuration = Math.floor(durationMinutes / window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket.minutesPerTicket);
    const appliedFreeTicketCount = applyTickets ? Math.min(remainingTickets, maxTicketsByDuration, window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket.grantedTicketCount) : 0;
    const freeMinutes = appliedFreeTicketCount * window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket.minutesPerTicket;
    const paidMinutes = Math.max(0, durationMinutes - freeMinutes);
    const finalPriceJpy = this.calculateBasePrice(paidMinutes);

    return {
      durationMinutes,
      basePriceJpy,
      appliedFreeTicketCount,
      freeMinutes,
      paidMinutes,
      finalPriceJpy
    };
  },

  formatJpy(value) {
    return `${Number(value).toLocaleString("ja-JP")}円`;
  },

  formatTimer(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const mm = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const ss = String(safeSeconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
};
