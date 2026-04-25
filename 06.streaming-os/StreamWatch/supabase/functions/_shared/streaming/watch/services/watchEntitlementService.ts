import { executeCommerceIntent, quotePurchase, readEntitlementProjection } from "../repositories/watchAdapterRepository.ts";
import { validateCommerceExecute, validateEntitlementRead, validatePurchaseQuote } from "../validators/watchEntitlementValidator.ts";

export async function entitlementRead(body: Record<string, unknown>) {
  const input = validateEntitlementRead(body);
  return readEntitlementProjection(input);
}

export async function purchaseQuote(body: Record<string, unknown>) {
  const input = validatePurchaseQuote(body);
  return quotePurchase(input);
}

export async function purchaseExecute(body: Record<string, unknown>) {
  const input = validateCommerceExecute(body);
  return executeCommerceIntent("purchase", input);
}

export async function rentalExecute(body: Record<string, unknown>) {
  const input = validateCommerceExecute(body);
  return executeCommerceIntent("rental", input);
}

export async function membershipJoinExecute(body: Record<string, unknown>) {
  const input = validateCommerceExecute(body);
  return executeCommerceIntent("membership", input);
}
