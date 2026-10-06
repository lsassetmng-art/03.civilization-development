import { DomainError } from "../common/errors.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CHANNEL_STATUSES =
  new Set([
    "active",
    "restricted",
    "suspended",
    "archived",
  ]);

const VISIBILITY_SETTINGS =
  new Set([
    "public",
    "limited",
    "restricted",
  ]);

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new DomainError(
      "invalid_request",
      "JSON object body is required",
      400,
    );
  }

  return value as Record<string, unknown>;
}

function requiredUuid(
  value: unknown,
  field: string,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value.trim())
  ) {
    throw new DomainError(
      "invalid_field",
      `${field} must be a UUID`,
      400,
      {
        field_name: field,
      },
    );
  }

  return value.trim();
}

function requiredActorUuid(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value.trim())
  ) {
    throw new DomainError(
      "unauthorized_actor",
      "actor_civilization_id is missing or invalid",
      401,
    );
  }

  return value.trim();
}

function optionalUuid(
  value: unknown,
  field: string,
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return requiredUuid(
    value,
    field,
  );
}

function requiredText(
  value: unknown,
  field: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new DomainError(
      "missing_required_field",
      `${field} is required`,
      400,
      {
        field_name: field,
      },
    );
  }

  return value.trim();
}

function nullableText(
  value: unknown,
  field: string,
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    throw new DomainError(
      "invalid_field",
      `${field} must be a string or null`,
      400,
      {
        field_name: field,
      },
    );
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function requiredBoolean(
  value: unknown,
  field: string,
): boolean {
  if (
    typeof value !== "boolean"
  ) {
    throw new DomainError(
      "missing_required_field",
      `${field} must be boolean`,
      400,
      {
        field_name: field,
      },
    );
  }

  return value;
}

export function validateChannelDetailRequest(
  channelRecordId: string,
  actorCivilizationId: string | null,
) {
  return {
    channel_record_id:
      requiredUuid(
        channelRecordId,
        "channel_record_id",
      ),

    actor_civilization_id:
      requiredActorUuid(
        actorCivilizationId,
      ),
  };
}

export function validateChannelUpsertRequest(
  value: unknown,
) {
  const body =
    asRecord(value);

  const channelStatus =
    requiredText(
      body.channel_status,
      "channel_status",
    );

  const visibilitySetting =
    requiredText(
      body.visibility_setting,
      "visibility_setting",
    );

  if (
    !CHANNEL_STATUSES.has(
      channelStatus,
    )
  ) {
    throw new DomainError(
      "unsupported_value",
      "channel_status is unsupported",
      400,
      {
        field_name:
          "channel_status",
      },
    );
  }

  if (
    !VISIBILITY_SETTINGS.has(
      visibilitySetting,
    )
  ) {
    throw new DomainError(
      "unsupported_value",
      "visibility_setting is unsupported",
      400,
      {
        field_name:
          "visibility_setting",
      },
    );
  }

  let idempotencyKey:
    string | null = null;

  if (
    body.idempotency_key !== undefined &&
    body.idempotency_key !== null
  ) {
    if (
      typeof body.idempotency_key !==
      "string"
    ) {
      throw new DomainError(
        "invalid_field",
        "idempotency_key must be a string",
        400,
        {
          field_name:
            "idempotency_key",
        },
      );
    }

    idempotencyKey =
      body.idempotency_key.trim();

    if (
      idempotencyKey.length < 1 ||
      idempotencyKey.length > 200
    ) {
      throw new DomainError(
        "invalid_field",
        "idempotency_key length must be 1..200",
        400,
        {
          field_name:
            "idempotency_key",
        },
      );
    }
  }

  return {
    actor_civilization_id:
      requiredActorUuid(
        body.actor_civilization_id,
      ),

    channel_record_id:
      optionalUuid(
        body.channel_record_id,
        "channel_record_id",
      ),

    channel_display_name:
      requiredText(
        body.channel_display_name,
        "channel_display_name",
      ),

    channel_status:
      channelStatus,

    official_channel_flag:
      requiredBoolean(
        body.official_channel_flag,
        "official_channel_flag",
      ),

    profile_description:
      nullableText(
        body.profile_description,
        "profile_description",
      ),

    artwork_reference:
      nullableText(
        body.artwork_reference,
        "artwork_reference",
      ),

    visibility_setting:
      visibilitySetting,

    idempotency_key:
      idempotencyKey,
  };
}
