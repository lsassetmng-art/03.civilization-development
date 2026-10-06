import type {
  SupabaseClient,
} from "npm:@supabase/supabase-js@2";

import { DomainError } from "../common/errors.ts";

const DATABASE_STATUS:
  Record<string, number> = {
    unauthorized_actor: 401,
    missing_required_field: 400,
    unsupported_value: 400,
    invalid_field: 400,
    target_not_found: 404,
    forbidden_action: 403,
    state_conflict: 409,
    retry_later: 503,
  };

function databaseFailure(
  error:
    | {
        message?: string;
        code?: string;
      }
    | null,
): never {
  const message =
    error?.message ?? "";

  const code =
    Object.keys(DATABASE_STATUS)
      .find(
        (candidate) =>
          message.includes(candidate),
      );

  if (code) {
    throw new DomainError(
      code,
      `Database rejected the request: ${code}`,
      DATABASE_STATUS[code],
    );
  }

  throw new DomainError(
    "internal_error",
    "Database request failed",
    500,
  );
}

function streaming(
  client: SupabaseClient,
) {
  return client.schema(
    "streaming",
  );
}

export async function selectChannelDetail(
  client: SupabaseClient,
  channelRecordId: string,
) {
  const {
    data: channel,
    error: channelError,
  } = await streaming(client)
    .from("channel_records")
    .select(
      "channel_record_id,channel_owner_civilization_id,channel_display_name,channel_status,official_channel_flag,updated_at",
    )
    .eq(
      "channel_record_id",
      channelRecordId,
    )
    .maybeSingle();

  if (channelError) {
    databaseFailure(
      channelError,
    );
  }

  if (!channel) {
    throw new DomainError(
      "target_not_found",
      "Channel was not found",
      404,
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await streaming(client)
    .from(
      "channel_profile_states",
    )
    .select(
      "channel_profile_state_id,profile_description,artwork_reference,visibility_setting,updated_at",
    )
    .eq(
      "channel_record_id",
      channelRecordId,
    )
    .maybeSingle();

  if (profileError) {
    databaseFailure(
      profileError,
    );
  }

  if (!profile) {
    throw new DomainError(
      "state_conflict",
      "Channel profile state is missing",
      409,
    );
  }

  const updatedAt =
    [
      channel.updated_at,
      profile.updated_at,
    ]
      .filter(
        (
          value,
        ): value is string =>
          typeof value ===
          "string",
      )
      .sort()
      .at(-1) ??
    channel.updated_at;

  return {
    channel_record_id:
      channel.channel_record_id,

    channel_owner_civilization_id:
      channel.channel_owner_civilization_id,

    channel_display_name:
      channel.channel_display_name,

    channel_status:
      channel.channel_status,

    official_channel_flag:
      channel.official_channel_flag,

    profile_description:
      profile.profile_description ??
      null,

    artwork_reference:
      profile.artwork_reference ??
      null,

    visibility_setting:
      profile.visibility_setting,

    updated_at:
      updatedAt,
  };
}

export async function upsertChannelRecord(
  client: SupabaseClient,
  input: {
    actor_civilization_id: string;
    channel_record_id: string | null;
    channel_display_name: string;
    channel_status: string;
    official_channel_flag: boolean;
    profile_description: string | null;
    artwork_reference: string | null;
    visibility_setting: string;
    idempotency_key: string | null;
  },
) {
  const {
    data,
    error,
  } = await streaming(client)
    .rpc(
      "upsert_channel_record",
      {
        p_actor_civilization_id:
          input.actor_civilization_id,

        p_channel_record_id:
          input.channel_record_id,

        p_channel_display_name:
          input.channel_display_name,

        p_channel_status:
          input.channel_status,

        p_official_channel_flag:
          input.official_channel_flag,

        p_profile_description:
          input.profile_description,

        p_artwork_reference:
          input.artwork_reference,

        p_visibility_setting:
          input.visibility_setting,

        p_idempotency_key:
          input.idempotency_key,
      },
    );

  if (error) {
    databaseFailure(error);
  }

  const raw =
    Array.isArray(data)
      ? data[0]
      : data;

  if (
    !raw ||
    typeof raw !== "object"
  ) {
    throw new DomainError(
      "internal_error",
      "Channel upsert returned no canonical result",
      500,
    );
  }

  const result =
    raw as Record<
      string,
      unknown
    >;

  if (
    typeof result.channel_record_id !==
      "string" ||
    typeof result.channel_profile_state_id !==
      "string" ||
    typeof result.channel_status !==
      "string" ||
    typeof result.updated_at !==
      "string"
  ) {
    throw new DomainError(
      "internal_error",
      "Channel upsert returned an invalid canonical result",
      500,
    );
  }

  return {
    channel_record_id:
      result.channel_record_id,

    channel_profile_state_id:
      result.channel_profile_state_id,

    channel_status:
      result.channel_status,

    updated_at:
      result.updated_at,

    idempotency_replayed:
      result.idempotency_replayed ===
      true,
  };
}
