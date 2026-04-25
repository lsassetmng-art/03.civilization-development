window.CCW_WORKER_RENTAL_MAPPING = {
  appCode: "CasualChatWorker",
  serviceCode: "casual_chat_worker",
  serviceName: "雑談ワーカー",
  workerOwnerSchema: "aiworker",

  supportedUnits: {
    minute: true,
    hour: false,
    day: false,
    month: false,
    year: false
  },

  minimumContract: {
    rentalUnitKind: "minute",
    rentalUnitCount: 30,
    totalMinutes: 30
  },

  appMaximumContract: {
    rentalUnitKind: "minute",
    rentalUnitCount: 120,
    totalMinutes: 120
  },

  monthlyFreeTicketRule: {
    enabled: true,
    sourceRule: "shortest_contract_duration",
    quantity: 2,
    entitlementUnitKind: "minute",
    entitlementUnitCount: 30,
    freeMinutesEach: 30,
    freeMinutesTotal: 60,
    carryoverEnabled: false
  },

  priceCatalog: [
    {
      appCode: "CasualChatWorker",
      serviceCode: "casual_chat_worker",
      priceVersion: "v1",
      rentalUnitKind: "minute",
      rentalUnitCount: 30,
      basePriceJpy: 500,
      currencyCode: "JPY"
    },
    {
      appCode: "CasualChatWorker",
      serviceCode: "casual_chat_worker",
      priceVersion: "v1",
      rentalUnitKind: "minute",
      rentalUnitCount: 60,
      basePriceJpy: 1000,
      currencyCode: "JPY"
    },
    {
      appCode: "CasualChatWorker",
      serviceCode: "casual_chat_worker",
      priceVersion: "v1",
      rentalUnitKind: "minute",
      rentalUnitCount: 90,
      basePriceJpy: 1500,
      currencyCode: "JPY"
    },
    {
      appCode: "CasualChatWorker",
      serviceCode: "casual_chat_worker",
      priceVersion: "v1",
      rentalUnitKind: "minute",
      rentalUnitCount: 120,
      basePriceJpy: 2000,
      currencyCode: "JPY"
    }
  ],

  validateRentalDuration(rentalUnitKind, rentalUnitCount) {
    if (rentalUnitKind !== "minute") {
      return {
        valid: false,
        reason: "CasualChatWorker v1 supports minute rental only."
      };
    }

    if (![30, 60, 90, 120].includes(rentalUnitCount)) {
      return {
        valid: false,
        reason: "CasualChatWorker supports only 30 / 60 / 90 / 120 minutes."
      };
    }

    if (rentalUnitCount > this.appMaximumContract.rentalUnitCount) {
      return {
        valid: false,
        reason: "CasualChatWorker maximum contract is 120 minutes."
      };
    }

    return {
      valid: true,
      reason: "ok"
    };
  }
};
