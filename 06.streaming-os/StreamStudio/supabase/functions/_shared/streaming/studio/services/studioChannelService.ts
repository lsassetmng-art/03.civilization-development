import {
  requireStreamingActor,
} from "../common/auth.ts";

import {
  selectChannelDetail,
  upsertChannelRecord,
} from "../repositories/studioChannelRepository.ts";

import {
  validateChannelDetailRequest,
  validateChannelUpsertRequest,
} from "../validators/studioChannelValidator.ts";

export async function getChannelDetail(
  req: Request,
  channelRecordId: string,
  actorCivilizationId: string | null,
) {
  const input =
    validateChannelDetailRequest(
      channelRecordId,
      actorCivilizationId,
    );

  const auth =
    await requireStreamingActor(
      req,
      input.actor_civilization_id,
    );

  return selectChannelDetail(
    auth.client,
    input.channel_record_id,
  );
}

export async function upsertChannel(
  req: Request,
  body: unknown,
) {
  const input =
    validateChannelUpsertRequest(
      body,
    );

  const auth =
    await requireStreamingActor(
      req,
      input.actor_civilization_id,
    );

  return upsertChannelRecord(
    auth.client,
    input,
  );
}
