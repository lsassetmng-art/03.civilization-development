window.CCW_WORKER_RENTAL_REPOSITORY = {
  getMode() {
    const config = window.CCW_RUNTIME_CONFIG || { apiMode: "mock" };
    return config.canUseRealApi && config.canUseRealApi() ? "real" : "mock";
  },

  async getFreeTicketBalance(userId = "00000000-0000-0000-0000-000000000001") {
    if (this.getMode() === "real") {
      return window.CCW_REAL_WORKER_RENTAL_API_ADAPTER.getEntitlementBalance(userId);
    }

    const balance = await window.CCW_BUSINESS_API_CLIENT.getFreeTicketBalance();
    return window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildFreeTicketBalanceResponse(userId, balance);
  },

  async quoteContract({ userId, worker, durationMinutes, requestedFreeTicketCount }) {
    const validation = window.CCW_WORKER_RENTAL_MAPPING.validateRentalDuration("minute", durationMinutes);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const quoteRequest = window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildQuoteRequest({
      userId,
      worker,
      durationMinutes,
      requestedFreeTicketCount
    });

    if (this.getMode() === "real") {
      return window.CCW_REAL_WORKER_RENTAL_API_ADAPTER.quoteRental(quoteRequest);
    }

    const quote = await window.CCW_BUSINESS_API_CLIENT.quoteContract({
      durationMinutes,
      applyTickets: requestedFreeTicketCount > 0
    });

    return window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildQuoteResponse({
      quoteId: `mock-quote-${Date.now()}`,
      worker,
      quote,
      availableFreeTicketCount: requestedFreeTicketCount
    });
  },

  async confirmContract({ userId, quoteId, worker, quote }) {
    const confirmRequest = window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildConfirmRequest({
      userId,
      quoteId,
      worker,
      quote: {
        durationMinutes: quote.rental_unit_count || quote.durationMinutes,
        appliedFreeTicketCount: quote.applied_entitlement_count || quote.appliedFreeTicketCount || 0,
        finalPriceJpy: quote.final_price_jpy || quote.finalPriceJpy || 0
      }
    });

    if (this.getMode() === "real") {
      return window.CCW_REAL_WORKER_RENTAL_API_ADAPTER.confirmRental(confirmRequest);
    }

    const localQuote = {
      durationMinutes: quote.rental_unit_count || quote.durationMinutes,
      basePriceJpy: quote.base_price_jpy || quote.basePriceJpy,
      appliedFreeTicketCount: quote.applied_entitlement_count || quote.appliedFreeTicketCount || 0,
      freeMinutes: quote.free_unit_count || quote.freeMinutes || 0,
      paidMinutes: quote.paid_unit_count || quote.paidMinutes || 0,
      finalPriceJpy: quote.final_price_jpy || quote.finalPriceJpy || 0
    };

    const contract = await window.CCW_BUSINESS_API_CLIENT.confirmContract({
      worker,
      quote: localQuote
    });

    const balance = await window.CCW_BUSINESS_API_CLIENT.getFreeTicketBalance();

    return window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT.buildConfirmResponse({
      contract,
      remainingFreeTicketCount: balance.remainingTicketCount
    });
  }
};
