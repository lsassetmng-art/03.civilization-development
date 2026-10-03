import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  isEntitlementActiveAt,
  isSubscriptionActiveAt,
  deriveCommercialAppState
} from "../business_app_commerce_contract.mjs";

import {
  buildBusinessPersonaCommercialEvent
} from "../business_persona_commercial_event_contract.mjs";

import {
  resolveBusinessAppCommercialSystemPolicy
} from "../../app-platform/business_app_commercial_entitlement_resolver.mjs";

import {
  buildMarketplaceCommercialProjection
} from "../../../../AppMarketplace/runtime/app_marketplace_commercial_adapter.mjs";

import {
  buildMyAppsViewModel
} from "../../../../MyApps/runtime/my_apps_adapter.mjs";

import {
  DEVELOPER_CONSOLE_COMMERCIAL_CAPABILITIES,
  validateCommercialDefinition
} from "../../../../DeveloperConsole/runtime/developer_console_commercial_policy.mjs";

const at = "2026-10-01T00:00:00Z";

const entitlement = {
  entitlement_id: "ent-1",
  user_id: "11111111-1111-4111-8111-111111111111",
  app_code: "PocketSecretary",
  product_id: "22222222-2222-4222-8222-222222222222",
  sku_id: "33333333-3333-4333-8333-333333333333",
  entitlement_state: "granted",
  effective_at: "2026-09-01T00:00:00Z",
  expires_at: null
};

const subscription = {
  subscription_id: "sub-1",
  user_id: entitlement.user_id,
  app_code: entitlement.app_code,
  product_id: entitlement.product_id,
  subscription_state: "active",
  effective_at: "2026-09-01T00:00:00Z"
};

assert.equal(isEntitlementActiveAt(entitlement, at), true);
assert.equal(isSubscriptionActiveAt(subscription, at), true);

assert.deepEqual(
  deriveCommercialAppState({
    entitlement,
    subscription,
    installation: { installation_state: "installed" },
    activation: { activation_state: "active" },
    at
  }),
  {
    commercialEntitlementActive: true,
    subscriptionActive: true,
    logicalModuleInstalled: true,
    logicalModuleActive: true,
    deviceInstallTruthOwner: "browser_or_device_os"
  }
);

const policy = resolveBusinessAppCommercialSystemPolicy({
  appId: "PocketSecretary",
  userRef: entitlement.user_id,
  resourceDomain: "app",
  actionType: "open",
  commercialRequirement: "required",
  entitlement,
  at
});

assert.equal(policy.effective_decision, "allowed");

const event = buildBusinessPersonaCommercialEvent({
  eventId: "event-1",
  eventType: "subscription_change",
  occurredAt: at,
  effectiveAt: at,
  payloadVersion: "1",
  idempotencyKey: "idem-1",
  producerTraceId: "trace-1",
  userId: entitlement.user_id,
  subjectType: "subscription",
  subjectId: "sub-1",
  payload: {
    subscription_id: "sub-1",
    prior_state: "pending",
    new_state: "active",
    plan_id: "plan-1",
    effective_at: at
  }
});

assert.equal(event.source_system, "BusinessOS");
assert.equal(event.payload.plan_id, "plan-1");

const marketplace = buildMarketplaceCommercialProjection({
  appCode: "PocketSecretary",
  truthLoaded: true,
  product: {
    product_id: entitlement.product_id,
    app_code: "PocketSecretary",
    product_state: "published"
  },
  sku: {
    sku_id: entitlement.sku_id,
    product_id: entitlement.product_id,
    sku_state: "active",
    purchase_type: "subscription",
    currency_code: "JPY",
    amount_minor: 1000
  },
  subscriptionPlan: {
    plan_id: "plan-1",
    product_id: entitlement.product_id,
    sku_id: entitlement.sku_id,
    plan_state: "active"
  }
});

assert.equal(marketplace.commercialStatus, "listed");
assert.equal(marketplace.amountMinor, 1000);

const myApps = buildMyAppsViewModel({
  entitlements: [entitlement],
  subscriptions: [subscription],
  moduleInstallations: [
    {
      user_id: entitlement.user_id,
      app_code: entitlement.app_code,
      module_code: "core",
      installation_state: "installed"
    }
  ],
  moduleActivations: [
    {
      user_id: entitlement.user_id,
      app_code: entitlement.app_code,
      module_code: "core",
      activation_state: "active"
    }
  ],
  at
});

assert.equal(myApps.length, 1);
assert.equal(myApps[0].owned, true);
assert.equal(myApps[0].subscribed, true);
assert.equal(myApps[0].logicalModuleInstalled, true);
assert.equal(myApps[0].logicalModuleActive, true);
assert.equal(
  myApps[0].deviceInstallTruthOwner,
  "browser_or_device_os"
);

assert.equal(
  DEVELOPER_CONSOLE_COMMERCIAL_CAPABILITIES.directEntitlementGrant,
  false
);

assert.equal(
  validateCommercialDefinition({
    appCode: "PocketSecretary",
    productCode: "pocket-secretary",
    productName: "Pocket Secretary",
    sku: {
      skuCode: "pocket-secretary-monthly",
      purchaseType: "subscription",
      currencyCode: "JPY",
      amountMinor: 1000
    },
    subscriptionPlan: {
      planCode: "monthly"
    }
  }).valid,
  true
);

const sqlPath = fileURLToPath(
  new URL(
    "../../../db/app-marketplace/001_business_app_commerce_core.sql",
    import.meta.url
  )
);

const sql = fs.readFileSync(sqlPath, "utf8");

assert.equal(
  (sql.match(/CREATE TABLE business\./g) || []).length,
  10
);

assert.match(sql, /business\.app_subscription_plan/);
assert.match(sql, /business\.business_persona_event_outbox/);
assert.doesNotMatch(sql, /\bpublic\./i);
assert.doesNotMatch(sql, /\bDROP\s+TABLE\b/i);

console.log("PASS_R15B3_BUSINESS_APP_COMMERCE_FOUNDATION");
