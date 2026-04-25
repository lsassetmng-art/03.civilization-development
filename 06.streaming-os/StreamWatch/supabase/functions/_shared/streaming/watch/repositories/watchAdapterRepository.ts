export async function readEntitlementProjection(input: {
  target_type: string;
  target_id: string;
}) {
  return {
    target_type: input.target_type,
    target_id: input.target_id,
    entitlement_state: "not_entitled",
    playback_cta: "purchase_or_join",
    archive_access_flag: false,
    source: "phase1_adapter_stub",
  };
}

export async function executeCommerceIntent(kind: "purchase" | "rental" | "membership", _payload: Record<string, unknown>) {
  return {
    result: "accepted_for_shared_commerce",
    transaction_state: `${kind}_pending_external_confirmation`,
    entitlement_refresh_required: true,
  };
}

export async function quotePurchase(_payload: Record<string, unknown>) {
  return {
    price_quote: {
      quote_id: crypto.randomUUID(),
      currency_code: "JPY",
      amount: 500,
      tax_included: true,
      source: "phase1_adapter_stub",
    },
  };
}
