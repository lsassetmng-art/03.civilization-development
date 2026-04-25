function assertPool(pool) {
  if (!pool || typeof pool.query !== "function") {
    throw new Error("PostgreSQL pool with query method is required.");
  }
}

function firstRow(result) {
  return result && Array.isArray(result.rows) ? result.rows[0] || null : null;
}

function createPostgresWorkerRentalRepository(pool) {
  assertPool(pool);

  return {
    async findServiceCatalog(appCode, serviceCode) {
      const result = await pool.query(
        `
        select *
        from business.v_worker_rental_service_catalog_active
        where app_code = $1
          and service_code = $2
        limit 1
        `,
        [appCode, serviceCode]
      );

      return firstRow(result);
    },

    async findMonthlyFreeTicketRule(appCode, serviceCode) {
      const result = await pool.query(
        `
        select *
        from business.v_worker_rental_monthly_free_ticket_rule
        where app_code = $1
          and service_code = $2
        limit 1
        `,
        [appCode, serviceCode]
      );

      return firstRow(result);
    },

    async findPriceRow(appCode, serviceCode, rentalUnitKind, rentalUnitCount) {
      const result = await pool.query(
        `
        select *
        from business.v_worker_rental_price_catalog_active
        where app_code = $1
          and service_code = $2
          and rental_unit_kind = $3
          and rental_unit_count = $4
          and is_active = true
        limit 1
        `,
        [appCode, serviceCode, rentalUnitKind, Number(rentalUnitCount)]
      );

      return firstRow(result);
    },

    async findEntitlementBalance(appCode, serviceCode, userId, grantPeriod) {
      const result = await pool.query(
        `
        select *
        from business.v_worker_rental_entitlement_balance_active
        where app_code = $1
          and service_code = $2
          and user_id = $3
          and grant_period = $4
        limit 1
        `,
        [appCode, serviceCode, userId, grantPeriod]
      );

      return firstRow(result);
    },

    async ensureMonthlyEntitlementBalance({ appCode, serviceCode, userId, grantPeriod }) {
      const existing = await this.findEntitlementBalance(appCode, serviceCode, userId, grantPeriod);
      if (existing) return existing;

      if (typeof pool.connect !== "function") {
        throw new Error("Pool connect method required for entitlement creation transaction.");
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const ruleResult = await client.query(
          `
          select *
          from business.v_worker_rental_monthly_free_ticket_rule
          where app_code = $1
            and service_code = $2
          limit 1
          `,
          [appCode, serviceCode]
        );

        const rule = firstRow(ruleResult);
        if (!rule) {
          throw new Error("Monthly free ticket rule not found.");
        }

        const grantResult = await client.query(
          `
          insert into business.worker_rental_entitlement_grant (
            app_code,
            service_code,
            user_id,
            grant_period,
            entitlement_kind,
            entitlement_source_rule,
            entitlement_unit_kind,
            entitlement_unit_count,
            granted_quantity,
            total_granted_units,
            carryover_enabled,
            grant_status
          )
          values (
            $1, $2, $3, $4,
            'monthly_shortest_contract_free_ticket',
            'shortest_contract_duration',
            $5,
            $6,
            $7,
            $8,
            $9,
            'granted'
          )
          on conflict (app_code, service_code, user_id, grant_period, entitlement_kind)
          do update set updated_at = now()
          returning *
          `,
          [
            appCode,
            serviceCode,
            userId,
            grantPeriod,
            rule.monthly_free_ticket_unit_kind,
            Number(rule.monthly_free_ticket_unit_count),
            Number(rule.monthly_free_ticket_quantity),
            Number(rule.free_ticket_minutes_total),
            Boolean(rule.monthly_free_ticket_carryover_enabled)
          ]
        );

        const grant = firstRow(grantResult);

        const balanceResult = await client.query(
          `
          insert into business.worker_rental_entitlement_balance (
            entitlement_grant_id,
            app_code,
            service_code,
            user_id,
            grant_period,
            entitlement_kind,
            entitlement_source_rule,
            entitlement_unit_kind,
            entitlement_unit_count,
            granted_quantity,
            used_quantity,
            remaining_quantity,
            remaining_total_units,
            balance_status
          )
          values (
            $1, $2, $3, $4, $5,
            'monthly_shortest_contract_free_ticket',
            'shortest_contract_duration',
            $6,
            $7,
            $8,
            0,
            $8,
            $9,
            'active'
          )
          on conflict (app_code, service_code, user_id, grant_period, entitlement_kind)
          do update set updated_at = now()
          returning *
          `,
          [
            grant.entitlement_grant_id,
            appCode,
            serviceCode,
            userId,
            grantPeriod,
            rule.monthly_free_ticket_unit_kind,
            Number(rule.monthly_free_ticket_unit_count),
            Number(rule.monthly_free_ticket_quantity),
            Number(rule.free_ticket_minutes_total)
          ]
        );

        await client.query("COMMIT");
        return firstRow(balanceResult);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async createConfirmedRentalTransaction({ payload, quote }) {
      if (typeof pool.connect !== "function") {
        throw new Error("Pool connect method required for confirm transaction.");
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const balanceResult = await client.query(
          `
          select *
          from business.worker_rental_entitlement_balance
          where app_code = $1
            and service_code = $2
            and user_id = $3
            and grant_period = $4
            and entitlement_kind = 'monthly_shortest_contract_free_ticket'
            and balance_status = 'active'
          for update
          `,
          [payload.app_code, payload.service_code, payload.user_id, "current"]
        );

        const balance = firstRow(balanceResult);
        const usedQuantity = Number(quote.applied_entitlement_count || 0);

        if (usedQuantity > 0) {
          if (!balance) {
            throw new Error("Entitlement balance not found.");
          }

          if (Number(balance.remaining_quantity) < usedQuantity) {
            throw new Error("Insufficient entitlement balance.");
          }
        }

        const contractResult = await client.query(
          `
          insert into business.worker_rental_contract (
            app_code,
            service_code,
            user_id,
            worker_owner_schema,
            worker_id,
            worker_type,
            rental_unit_kind,
            rental_unit_count,
            base_price_jpy,
            applied_entitlement_count,
            free_unit_count,
            paid_unit_count,
            final_price_jpy,
            contract_status,
            price_version,
            locale
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13,
            'confirmed',
            $14,
            $15
          )
          returning *
          `,
          [
            payload.app_code,
            payload.service_code,
            payload.user_id,
            payload.worker_owner_schema,
            payload.worker_id,
            payload.worker_type,
            payload.rental_unit_kind,
            Number(payload.rental_unit_count),
            Number(quote.base_price_jpy),
            usedQuantity,
            Number(quote.free_unit_count || 0),
            Number(quote.paid_unit_count || 0),
            Number(quote.final_price_jpy || 0),
            quote.price_version || "v1",
            payload.locale || "ja"
          ]
        );

        const contract = firstRow(contractResult);

        await client.query(
          `
          insert into business.worker_rental_contract_line (
            rental_contract_id,
            line_type,
            rental_unit_kind,
            rental_unit_count,
            quantity,
            unit_price_jpy,
            amount_jpy,
            note
          )
          values
            ($1, 'base_rental', $2, $3, 1, $4, $4, 'base rental'),
            ($1, 'entitlement_discount', $2, $5, $6, 500, $7, 'monthly shortest contract free ticket')
          `,
          [
            contract.rental_contract_id,
            payload.rental_unit_kind,
            Number(payload.rental_unit_count),
            Number(quote.base_price_jpy),
            Number(quote.free_unit_count || 0),
            usedQuantity,
            -1 * Math.max(0, Number(quote.base_price_jpy) - Number(quote.final_price_jpy || 0))
          ]
        );

        const periodResult = await client.query(
          `
          insert into business.worker_rental_period (
            rental_contract_id,
            user_id,
            worker_owner_schema,
            worker_id,
            worker_type,
            period_status,
            remaining_seconds_snapshot
          )
          values (
            $1, $2, $3, $4, $5, 'scheduled', $6
          )
          returning *
          `,
          [
            contract.rental_contract_id,
            payload.user_id,
            payload.worker_owner_schema,
            payload.worker_id,
            payload.worker_type,
            Number(payload.rental_unit_count) * 60
          ]
        );

        const period = firstRow(periodResult);

        const paymentResult = await client.query(
          `
          insert into business.worker_rental_payment_intent (
            rental_contract_id,
            user_id,
            amount_jpy,
            currency_code,
            payment_status
          )
          values (
            $1, $2, $3, 'JPY', $4
          )
          returning *
          `,
          [
            contract.rental_contract_id,
            payload.user_id,
            Number(quote.final_price_jpy || 0),
            Number(quote.final_price_jpy || 0) === 0 ? "not_required" : "pending"
          ]
        );

        const payment = firstRow(paymentResult);
        let entitlementUsage = null;
        let updatedBalance = balance;

        if (usedQuantity > 0) {
          const entitlementUsageResult = await client.query(
            `
            insert into business.worker_rental_entitlement_usage (
              entitlement_grant_id,
              entitlement_balance_id,
              rental_contract_id,
              rental_period_id,
              app_code,
              service_code,
              user_id,
              entitlement_kind,
              entitlement_source_rule,
              used_quantity,
              used_unit_kind,
              used_unit_count,
              discounted_amount_jpy,
              final_price_jpy,
              usage_status
            )
            values (
              $1, $2, $3, $4, $5, $6, $7,
              'monthly_shortest_contract_free_ticket',
              'shortest_contract_duration',
              $8,
              'minute',
              $9,
              $10,
              $11,
              'reserved'
            )
            returning *
            `,
            [
              balance.entitlement_grant_id,
              balance.entitlement_balance_id,
              contract.rental_contract_id,
              period.rental_period_id,
              payload.app_code,
              payload.service_code,
              payload.user_id,
              usedQuantity,
              Number(quote.free_unit_count || 0),
              Math.max(0, Number(quote.base_price_jpy) - Number(quote.final_price_jpy || 0)),
              Number(quote.final_price_jpy || 0)
            ]
          );

          entitlementUsage = firstRow(entitlementUsageResult);

          const updateBalanceResult = await client.query(
            `
            update business.worker_rental_entitlement_balance
            set
              used_quantity = used_quantity + $2,
              remaining_quantity = remaining_quantity - $2,
              remaining_total_units = (remaining_quantity - $2) * entitlement_unit_count,
              updated_at = now()
            where entitlement_balance_id = $1
              and remaining_quantity >= $2
            returning *
            `,
            [balance.entitlement_balance_id, usedQuantity]
          );

          updatedBalance = firstRow(updateBalanceResult);
          if (!updatedBalance) {
            throw new Error("Entitlement balance update failed.");
          }
        }

        await client.query(
          `
          insert into business.worker_rental_status_history (
            rental_contract_id,
            from_status,
            to_status,
            reason
          )
          values ($1, 'quoted', 'confirmed', 'confirm endpoint')
          `,
          [contract.rental_contract_id]
        );

        await client.query("COMMIT");

        return {
          contract,
          period,
          payment,
          entitlementUsage,
          balance: updatedBalance
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  };
}

module.exports = {
  createPostgresWorkerRentalRepository
};
