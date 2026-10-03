import {
  getApp as getRegisteredApp
} from "../../_businessos/runtime/app-platform/business_app_runtime.mjs";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function unresolved(appCode, reason) {
  return Object.freeze({
    appCode,
    commercialStatus: "unresolved",
    reason
  });
}

/*
 * This adapter never infers purchase, ownership, subscription or physical
 * device installation state.
 */
export function buildMarketplaceCommercialProjection(input = {}) {
  const appCode = text(input.appCode);

  if (!appCode || !getRegisteredApp(appCode)) {
    return unresolved(appCode, "app_not_registered");
  }

  if (input.truthLoaded !== true) {
    return unresolved(appCode, "commercial_truth_not_loaded");
  }

  const product = input.product;

  if (
    !product ||
    product.app_code !== appCode ||
    product.product_state !== "published"
  ) {
    return Object.freeze({
      appCode,
      commercialStatus: "not_listed"
    });
  }

  const sku = input.sku;

  if (
    !sku ||
    sku.product_id !== product.product_id ||
    sku.sku_state !== "active"
  ) {
    return unresolved(appCode, "active_sku_unresolved");
  }

  if (
    !Number.isSafeInteger(sku.amount_minor) ||
    sku.amount_minor < 0 ||
    !/^[A-Z]{3}$/.test(text(sku.currency_code))
  ) {
    return unresolved(appCode, "sku_price_invalid");
  }

  let planId = null;

  if (sku.purchase_type === "subscription") {
    const plan = input.subscriptionPlan;

    if (
      !plan ||
      plan.product_id !== product.product_id ||
      plan.sku_id !== sku.sku_id ||
      plan.plan_state !== "active"
    ) {
      return unresolved(
        appCode,
        "active_subscription_plan_unresolved"
      );
    }

    planId = plan.plan_id;
  }

  return Object.freeze({
    appCode,
    commercialStatus: "listed",
    productId: product.product_id,
    skuId: sku.sku_id,
    purchaseType: sku.purchase_type,
    currencyCode: sku.currency_code,
    amountMinor: sku.amount_minor,
    subscriptionPlanId: planId,
    deviceInstallTruthOwner: "browser_or_device_os"
  });
}
