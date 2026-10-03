export const APP_PRODUCT_STATES = Object.freeze([
  "draft",
  "published",
  "suspended",
  "retired"
]);

export const APP_SKU_STATES = Object.freeze([
  "draft",
  "active",
  "suspended",
  "retired"
]);

export const APP_SUBSCRIPTION_STATES = Object.freeze([
  "active",
  "suspended",
  "canceled",
  "expired"
]);

export const APP_ENTITLEMENT_STATES = Object.freeze([
  "granted",
  "suspended",
  "revoked",
  "expired"
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function instant(value) {
  if (!value) {
    return null;
  }

  const result = Date.parse(value);
  return Number.isFinite(result) ? result : null;
}

function nowMillis(value) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = instant(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return Date.now();
}

export function isEntitlementActiveAt(entitlement, at) {
  if (!entitlement || typeof entitlement !== "object") {
    return false;
  }

  if (text(entitlement.entitlement_state) !== "granted") {
    return false;
  }

  const effectiveAt = instant(entitlement.effective_at);

  if (effectiveAt === null) {
    return false;
  }

  const current = nowMillis(at);

  if (effectiveAt > current) {
    return false;
  }

  if (entitlement.expires_at) {
    const expiresAt = instant(entitlement.expires_at);

    if (expiresAt === null || expiresAt <= current) {
      return false;
    }
  }

  return true;
}

export function isSubscriptionActiveAt(subscription, at) {
  if (!subscription || typeof subscription !== "object") {
    return false;
  }

  if (text(subscription.subscription_state) !== "active") {
    return false;
  }

  const effectiveAt = instant(subscription.effective_at);

  if (effectiveAt === null || effectiveAt > nowMillis(at)) {
    return false;
  }

  return true;
}

export function isLogicalModuleInstalled(installation) {
  return Boolean(
    installation &&
    text(installation.installation_state) === "installed"
  );
}

export function isLogicalModuleActive(activation) {
  return Boolean(
    activation &&
    text(activation.activation_state) === "active"
  );
}

export function deriveCommercialAppState(input = {}) {
  return Object.freeze({
    commercialEntitlementActive: isEntitlementActiveAt(
      input.entitlement,
      input.at
    ),
    subscriptionActive: isSubscriptionActiveAt(
      input.subscription,
      input.at
    ),
    logicalModuleInstalled: isLogicalModuleInstalled(
      input.installation
    ),
    logicalModuleActive: isLogicalModuleActive(
      input.activation
    ),
    deviceInstallTruthOwner: "browser_or_device_os"
  });
}
