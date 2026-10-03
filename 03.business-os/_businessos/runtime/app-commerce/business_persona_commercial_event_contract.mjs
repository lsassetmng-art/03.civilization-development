const EVENT_TYPES = Object.freeze([
  "purchase_complete",
  "grant",
  "revoke",
  "subscription_change"
]);

const SUBJECT_TYPES = Object.freeze([
  "product",
  "sku",
  "order",
  "subscription",
  "entitlement",
  "persona"
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireText(object, key) {
  if (!text(object?.[key])) {
    throw new TypeError(`Missing required field: ${key}`);
  }
}

function validatePayload(eventType, payload) {
  if (!payload || typeof payload !== "object") {
    throw new TypeError("Commercial event payload is required");
  }

  if (eventType === "purchase_complete") {
    for (const key of [
      "order_id",
      "purchase_status",
      "purchased_at",
      "commercial_effective_at",
      "product_id"
    ]) {
      requireText(payload, key);
    }

    if (payload.purchase_status !== "completed") {
      throw new TypeError(
        "purchase_complete requires purchase_status=completed"
      );
    }

    if (typeof payload.commercial_right_created !== "boolean") {
      throw new TypeError(
        "commercial_right_created must be boolean"
      );
    }
  }

  if (eventType === "grant") {
    for (const key of [
      "entitlement_id",
      "grant_reason_code",
      "effective_at"
    ]) {
      requireText(payload, key);
    }

    if (payload.entitlement_state !== "granted") {
      throw new TypeError(
        "grant requires entitlement_state=granted"
      );
    }
  }

  if (eventType === "revoke") {
    for (const key of [
      "entitlement_id",
      "revoke_reason_code",
      "effective_at"
    ]) {
      requireText(payload, key);
    }

    if (payload.entitlement_state !== "revoked") {
      throw new TypeError(
        "revoke requires entitlement_state=revoked"
      );
    }
  }

  if (eventType === "subscription_change") {
    for (const key of [
      "subscription_id",
      "prior_state",
      "new_state",
      "plan_id",
      "effective_at"
    ]) {
      requireText(payload, key);
    }
  }
}

export function buildBusinessPersonaCommercialEvent(input = {}) {
  const eventType = text(input.eventType);
  const subjectType = text(input.subjectType);

  if (!EVENT_TYPES.includes(eventType)) {
    throw new TypeError("Unsupported commercial event type");
  }

  if (!SUBJECT_TYPES.includes(subjectType)) {
    throw new TypeError("Unsupported commercial subject type");
  }

  for (const key of [
    "eventId",
    "occurredAt",
    "payloadVersion",
    "idempotencyKey",
    "producerTraceId",
    "subjectId"
  ]) {
    if (!text(input[key])) {
      throw new TypeError(`Missing event envelope field: ${key}`);
    }
  }

  validatePayload(eventType, input.payload);

  return Object.freeze({
    event_id: text(input.eventId),
    event_type: eventType,
    source_system: "BusinessOS",
    occurred_at: text(input.occurredAt),
    effective_at: text(input.effectiveAt) || null,
    payload_version: text(input.payloadVersion),
    idempotency_key: text(input.idempotencyKey),
    producer_trace_id: text(input.producerTraceId),
    causation_event_id: text(input.causationEventId) || null,
    correlation_id: text(input.correlationId) || null,
    tenant_scope: text(input.tenantScope) || null,
    user_id: text(input.userId) || null,
    persona_id: text(input.personaId) || null,
    subject_type: subjectType,
    subject_id: text(input.subjectId),
    payload: Object.freeze({ ...input.payload })
  });
}

export const BUSINESS_PERSONA_COMMERCIAL_EVENT_TYPES =
  EVENT_TYPES;
