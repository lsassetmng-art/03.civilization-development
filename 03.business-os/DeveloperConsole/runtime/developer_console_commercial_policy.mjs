export const DEVELOPER_CONSOLE_COMMERCIAL_CAPABILITIES =
  Object.freeze({
    productDefinitionWrite: true,
    skuDefinitionWrite: true,
    subscriptionPlanDefinitionWrite: true,
    directEntitlementGrant: false,
    directEntitlementRevoke: false,
    finalizePurchase: false,
    deviceInstallationWrite: false
  });

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCommercialDefinition(input = {}) {
  const errors = [];

  if (!text(input.appCode)) {
    errors.push("app_code_required");
  }

  if (!text(input.productCode)) {
    errors.push("product_code_required");
  }

  if (!text(input.productName)) {
    errors.push("product_name_required");
  }

  if (input.sku) {
    if (!text(input.sku.skuCode)) {
      errors.push("sku_code_required");
    }

    if (
      input.sku.purchaseType !== "one_time" &&
      input.sku.purchaseType !== "subscription"
    ) {
      errors.push("purchase_type_invalid");
    }

    if (
      !Number.isSafeInteger(input.sku.amountMinor) ||
      input.sku.amountMinor < 0
    ) {
      errors.push("amount_minor_invalid");
    }

    if (!/^[A-Z]{3}$/.test(text(input.sku.currencyCode))) {
      errors.push("currency_code_invalid");
    }

    if (
      input.sku.purchaseType === "subscription" &&
      !input.subscriptionPlan
    ) {
      errors.push("subscription_plan_required");
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}
