const crypto = require("crypto");

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createInMemoryWorkerRentalRepository() {
  const state = {
    serviceCatalog: {
      app_code: "CasualChatWorker",
      service_code: "casual_chat_worker",
      service_name: "雑談ワーカー",
      supports_minute: true,
      supports_hour: false,
      supports_day: false,
      supports_month: false,
      supports_year: false,
      minimum_contract_unit_kind: "minute",
      minimum_contract_unit_count: 30,
      minimum_contract_minutes: 30,
      app_max_contract_unit_kind: "minute",
      app_max_contract_unit_count: 120,
      app_max_contract_minutes: 120,
      monthly_free_ticket_enabled: true,
      monthly_free_ticket_quantity: 2,
      monthly_free_ticket_source_rule: "shortest_contract_duration",
      monthly_free_ticket_unit_kind: "minute",
      monthly_free_ticket_unit_count: 30,
      monthly_free_ticket_carryover_enabled: false
    },
    priceRows: [
      { rental_unit_kind: "minute", rental_unit_count: 30, rental_total_minutes: 30, base_price_jpy: 500, price_version: "v1", currency_code: "JPY" },
      { rental_unit_kind: "minute", rental_unit_count: 60, rental_total_minutes: 60, base_price_jpy: 1000, price_version: "v1", currency_code: "JPY" },
      { rental_unit_kind: "minute", rental_unit_count: 90, rental_total_minutes: 90, base_price_jpy: 1500, price_version: "v1", currency_code: "JPY" },
      { rental_unit_kind: "minute", rental_unit_count: 120, rental_total_minutes: 120, base_price_jpy: 2000, price_version: "v1", currency_code: "JPY" }
    ],
    entitlementBalances: new Map(),
    contracts: [],
    periods: [],
    payments: [],
    entitlementUsages: [],
    statusHistory: []
  };

  function balanceKey(appCode, serviceCode, userId, grantPeriod) {
    return `${appCode}:${serviceCode}:${userId}:${grantPeriod}`;
  }

  return {
    state,

    async findServiceCatalog(appCode, serviceCode) {
      if (state.serviceCatalog.app_code === appCode && state.serviceCatalog.service_code === serviceCode) {
        return state.serviceCatalog;
      }
      return null;
    },

    async findMonthlyFreeTicketRule(appCode, serviceCode) {
      const row = await this.findServiceCatalog(appCode, serviceCode);
      if (!row || !row.monthly_free_ticket_enabled) return null;

      return {
        app_code: row.app_code,
        service_code: row.service_code,
        monthly_free_ticket_quantity: row.monthly_free_ticket_quantity,
        monthly_free_ticket_source_rule: row.monthly_free_ticket_source_rule,
        monthly_free_ticket_unit_kind: row.monthly_free_ticket_unit_kind,
        monthly_free_ticket_unit_count: row.monthly_free_ticket_unit_count,
        free_ticket_minutes_each: row.monthly_free_ticket_unit_count,
        free_ticket_minutes_total: row.monthly_free_ticket_quantity * row.monthly_free_ticket_unit_count,
        monthly_free_ticket_carryover_enabled: row.monthly_free_ticket_carryover_enabled
      };
    },

    async findPriceRow(appCode, serviceCode, rentalUnitKind, rentalUnitCount) {
      if (appCode !== "CasualChatWorker" || serviceCode !== "casual_chat_worker") return null;
      return state.priceRows.find((row) => row.rental_unit_kind === rentalUnitKind && row.rental_unit_count === Number(rentalUnitCount)) || null;
    },

    async ensureMonthlyEntitlementBalance({ appCode, serviceCode, userId, grantPeriod }) {
      const key = balanceKey(appCode, serviceCode, userId, grantPeriod);
      const existing = state.entitlementBalances.get(key);
      if (existing) return existing;

      const rule = await this.findMonthlyFreeTicketRule(appCode, serviceCode);
      if (!rule) throw new Error("Monthly free ticket rule not found.");

      const balance = {
        entitlement_balance_id: newId("entitlement-balance"),
        entitlement_grant_id: newId("entitlement-grant"),
        app_code: appCode,
        service_code: serviceCode,
        user_id: userId,
        grant_period: grantPeriod,
        entitlement_kind: "monthly_shortest_contract_free_ticket",
        entitlement_source_rule: rule.monthly_free_ticket_source_rule,
        entitlement_unit_kind: rule.monthly_free_ticket_unit_kind,
        entitlement_unit_count: rule.monthly_free_ticket_unit_count,
        granted_quantity: rule.monthly_free_ticket_quantity,
        used_quantity: 0,
        remaining_quantity: rule.monthly_free_ticket_quantity,
        remaining_total_units: rule.free_ticket_minutes_total,
        balance_status: "active"
      };

      state.entitlementBalances.set(key, balance);
      return balance;
    },

    async findEntitlementBalance(appCode, serviceCode, userId, grantPeriod) {
      return this.ensureMonthlyEntitlementBalance({ appCode, serviceCode, userId, grantPeriod });
    },

    async createConfirmedRentalTransaction({ payload, quote }) {
      const balance = await this.findEntitlementBalance(payload.app_code, payload.service_code, payload.user_id, "current");

      if (Number(balance.remaining_quantity) < Number(quote.applied_entitlement_count || 0)) {
        throw new Error("Insufficient entitlement balance.");
      }

      balance.used_quantity += Number(quote.applied_entitlement_count || 0);
      balance.remaining_quantity -= Number(quote.applied_entitlement_count || 0);
      balance.remaining_total_units = balance.remaining_quantity * balance.entitlement_unit_count;

      const contract = {
        rental_contract_id: newId("rental-contract"),
        app_code: payload.app_code,
        service_code: payload.service_code,
        user_id: payload.user_id,
        worker_owner_schema: payload.worker_owner_schema,
        worker_id: payload.worker_id,
        worker_type: payload.worker_type,
        rental_unit_kind: payload.rental_unit_kind,
        rental_unit_count: Number(payload.rental_unit_count),
        rental_total_minutes: Number(payload.rental_unit_count),
        base_price_jpy: Number(quote.base_price_jpy),
        applied_entitlement_count: Number(quote.applied_entitlement_count || 0),
        free_unit_count: Number(quote.free_unit_count || 0),
        paid_unit_count: Number(quote.paid_unit_count || 0),
        final_price_jpy: Number(quote.final_price_jpy || 0),
        contract_status: "confirmed",
        price_version: quote.price_version || "v1"
      };

      const period = {
        rental_period_id: newId("rental-period"),
        rental_contract_id: contract.rental_contract_id,
        user_id: payload.user_id,
        worker_owner_schema: payload.worker_owner_schema,
        worker_id: payload.worker_id,
        worker_type: payload.worker_type,
        period_status: "scheduled"
      };

      const payment = {
        rental_payment_intent_id: newId("rental-payment"),
        rental_contract_id: contract.rental_contract_id,
        user_id: payload.user_id,
        amount_jpy: contract.final_price_jpy,
        currency_code: "JPY",
        payment_status: contract.final_price_jpy === 0 ? "not_required" : "pending"
      };

      const entitlementUsage = {
        entitlement_usage_id: newId("entitlement-usage"),
        entitlement_balance_id: balance.entitlement_balance_id,
        rental_contract_id: contract.rental_contract_id,
        rental_period_id: period.rental_period_id,
        app_code: payload.app_code,
        service_code: payload.service_code,
        user_id: payload.user_id,
        entitlement_kind: "monthly_shortest_contract_free_ticket",
        entitlement_source_rule: "shortest_contract_duration",
        used_quantity: contract.applied_entitlement_count,
        used_unit_kind: "minute",
        used_unit_count: contract.free_unit_count,
        discounted_amount_jpy: contract.free_unit_count / 30 * 500,
        final_price_jpy: contract.final_price_jpy,
        usage_status: "reserved"
      };

      const statusHistory = {
        rental_status_history_id: newId("rental-status"),
        rental_contract_id: contract.rental_contract_id,
        from_status: "quoted",
        to_status: "confirmed",
        reason: "confirm endpoint"
      };

      state.contracts.push(contract);
      state.periods.push(period);
      state.payments.push(payment);
      state.entitlementUsages.push(entitlementUsage);
      state.statusHistory.push(statusHistory);

      return {
        contract,
        period,
        payment,
        entitlementUsage,
        balance
      };
    }
  };
}

module.exports = {
  createInMemoryWorkerRentalRepository
};
