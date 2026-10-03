import {
  getApp as getRegisteredApp
} from "../../_businessos/runtime/app-platform/business_app_runtime.mjs";

import {
  isEntitlementActiveAt,
  isSubscriptionActiveAt,
  isLogicalModuleInstalled,
  isLogicalModuleActive
} from "../../_businessos/runtime/app-commerce/business_app_commerce_contract.mjs";

function same(valueA, valueB) {
  return valueA === valueB;
}

export function buildMyAppsViewModel(input = {}) {
  const entitlements = Array.isArray(input.entitlements)
    ? input.entitlements
    : [];

  const subscriptions = Array.isArray(input.subscriptions)
    ? input.subscriptions
    : [];

  const installations = Array.isArray(input.moduleInstallations)
    ? input.moduleInstallations
    : [];

  const activations = Array.isArray(input.moduleActivations)
    ? input.moduleActivations
    : [];

  return Object.freeze(
    entitlements
      .filter((row) => isEntitlementActiveAt(row, input.at))
      .map((entitlement) => {
        const app = getRegisteredApp(entitlement.app_code);

        const subscription =
          subscriptions.find(
            (row) =>
              same(row.user_id, entitlement.user_id) &&
              same(row.app_code, entitlement.app_code) &&
              same(row.product_id, entitlement.product_id) &&
              isSubscriptionActiveAt(row, input.at)
          ) || null;

        const appInstallations = installations.filter(
          (row) =>
            same(row.user_id, entitlement.user_id) &&
            same(row.app_code, entitlement.app_code)
        );

        const appActivations = activations.filter(
          (row) =>
            same(row.user_id, entitlement.user_id) &&
            same(row.app_code, entitlement.app_code)
        );

        return Object.freeze({
          appCode: entitlement.app_code,
          appName: app?.app_name || entitlement.app_code,
          runtimeRegistrationStatus:
            app?.runtime_registration_status || "unregistered",
          entitlementId: entitlement.entitlement_id,
          productId: entitlement.product_id,
          skuId: entitlement.sku_id || null,
          owned: true,
          subscribed: Boolean(subscription),
          logicalModuleInstalled:
            appInstallations.some(isLogicalModuleInstalled),
          logicalModuleActive:
            appActivations.some(isLogicalModuleActive),
          deviceInstallTruthOwner: "browser_or_device_os"
        });
      })
  );
}
