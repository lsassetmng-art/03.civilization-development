window.CCW_TICKET_DOMAIN = {
  createDefaultBalance() {
    const canon = window.CCW_DOMAIN_CONSTANTS.monthlyFreeTicket;
    return {
      targetMonth: "current",
      grantedTicketCount: canon.grantedTicketCount,
      remainingTicketCount: canon.grantedTicketCount,
      minutesPerTicket: canon.minutesPerTicket,
      remainingFreeMinutes: canon.grantedTicketCount * canon.minutesPerTicket,
      carryoverEnabled: canon.carryoverEnabled
    };
  },

  applyUsage(balance, appliedTicketCount) {
    const nextRemaining = Math.max(0, balance.remainingTicketCount - appliedTicketCount);
    return {
      ...balance,
      remainingTicketCount: nextRemaining,
      remainingFreeMinutes: nextRemaining * balance.minutesPerTicket
    };
  },

  getDisplayText(balance) {
    return `無料チケット ${balance.remainingTicketCount}/${balance.grantedTicketCount}枚`;
  }
};
