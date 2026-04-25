window.CCW_WORKER_RENTAL_PAYLOAD_CLIENT = {
  buildFreeTicketBalanceResponse(userId, balance) {
    const rule = window.CCW_WORKER_RENTAL_MAPPING.monthlyFreeTicketRule;

    return {
      app_code: window.CCW_WORKER_RENTAL_MAPPING.appCode,
      service_code: window.CCW_WORKER_RENTAL_MAPPING.serviceCode,
      user_id: userId,
      grant_period: "current",
      entitlement_kind: "monthly_shortest_contract_free_ticket",
      entitlement_source_rule: rule.sourceRule,
      entitlement_unit_kind: rule.entitlementUnitKind,
      entitlement_unit_count: rule.entitlementUnitCount,
      granted_quantity: rule.quantity,
      used_quantity: rule.quantity - balance.remainingTicketCount,
      remaining_quantity: balance.remainingTicketCount,
      remaining_total_units: balance.remainingTicketCount * rule.entitlementUnitCount,
      free_ticket_minutes_each: rule.freeMinutesEach,
      free_ticket_minutes_total_remaining: balance.remainingTicketCount * rule.freeMinutesEach,
      carryover_enabled: rule.carryoverEnabled
    };
  },

  buildQuoteRequest({ userId, worker, durationMinutes, requestedFreeTicketCount }) {
    return {
      app_code: window.CCW_WORKER_RENTAL_MAPPING.appCode,
      service_code: window.CCW_WORKER_RENTAL_MAPPING.serviceCode,
      user_id: userId,
      worker_owner_schema: window.CCW_WORKER_RENTAL_MAPPING.workerOwnerSchema,
      worker_id: worker.aiWorkerId,
      worker_type: worker.workerType,
      rental_unit_kind: "minute",
      rental_unit_count: durationMinutes,
      requested_entitlement_kind: "monthly_shortest_contract_free_ticket",
      requested_entitlement_count: requestedFreeTicketCount,
      currency_code: "JPY"
    };
  },

  buildQuoteResponse({ quoteId, worker, quote, availableFreeTicketCount }) {
    return {
      quote_id: quoteId,
      app_code: window.CCW_WORKER_RENTAL_MAPPING.appCode,
      service_code: window.CCW_WORKER_RENTAL_MAPPING.serviceCode,
      worker_owner_schema: window.CCW_WORKER_RENTAL_MAPPING.workerOwnerSchema,
      worker_id: worker.aiWorkerId,
      worker_type: worker.workerType,
      rental_unit_kind: "minute",
      rental_unit_count: quote.durationMinutes,
      rental_total_minutes: quote.durationMinutes,
      base_price_jpy: quote.basePriceJpy,
      available_entitlement_count: availableFreeTicketCount,
      applied_entitlement_count: quote.appliedFreeTicketCount,
      free_unit_count: quote.freeMinutes,
      paid_unit_count: quote.paidMinutes,
      final_price_jpy: quote.finalPriceJpy,
      entitlement_kind: "monthly_shortest_contract_free_ticket",
      entitlement_source_rule: "shortest_contract_duration",
      price_version: "v1",
      currency_code: "JPY"
    };
  },

  buildConfirmRequest({ userId, quoteId, worker, quote }) {
    return {
      app_code: window.CCW_WORKER_RENTAL_MAPPING.appCode,
      service_code: window.CCW_WORKER_RENTAL_MAPPING.serviceCode,
      user_id: userId,
      quote_id: quoteId,
      worker_owner_schema: window.CCW_WORKER_RENTAL_MAPPING.workerOwnerSchema,
      worker_id: worker.aiWorkerId,
      worker_type: worker.workerType,
      rental_unit_kind: "minute",
      rental_unit_count: quote.durationMinutes,
      apply_entitlement_count: quote.appliedFreeTicketCount,
      confirmed_price_jpy: quote.finalPriceJpy
    };
  },

  buildConfirmResponse({ contract, remainingFreeTicketCount }) {
    return {
      rental_contract_id: contract.contractId,
      rental_period_id: contract.sessionId,
      app_code: window.CCW_WORKER_RENTAL_MAPPING.appCode,
      service_code: window.CCW_WORKER_RENTAL_MAPPING.serviceCode,
      status: "confirmed",
      worker_owner_schema: window.CCW_WORKER_RENTAL_MAPPING.workerOwnerSchema,
      worker_id: contract.aiWorkerId,
      worker_type: contract.workerType,
      rental_unit_kind: "minute",
      rental_unit_count: contract.durationMinutes,
      rental_total_minutes: contract.durationMinutes,
      applied_entitlement_count: contract.appliedFreeTicketCount,
      free_unit_count: contract.freeMinutes,
      paid_unit_count: contract.paidMinutes,
      final_price_jpy: contract.finalPriceJpy,
      remaining_entitlement_count: remainingFreeTicketCount
    };
  }
};
