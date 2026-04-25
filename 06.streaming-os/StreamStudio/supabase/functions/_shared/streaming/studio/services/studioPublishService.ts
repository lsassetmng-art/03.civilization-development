import { prefixedId } from "../common/ids.ts";
import {
  insertPublishRequest,
  listPublishHistory,
  selectPublishSettingByRef,
  updatePublishRequest,
  upsertPublishSetting,
} from "../repositories/studioPublishRepository.ts";
import {
  validateCreatePublishRequest,
  validatePublishHistory,
  validateSchedulePublish,
  validateUpsertPublishSetting,
} from "../validators/studioPublishValidator.ts";

export async function savePublishSetting(publish_ref: string, body: Record<string, unknown>) {
  const input = validateUpsertPublishSetting(body, publish_ref);
  const publish_setting = await upsertPublishSetting(input);
  return { publish_setting };
}

export async function validatePublishReadiness(publish_ref: string) {
  const publish_setting = await selectPublishSettingByRef(publish_ref);
  return {
    readiness: {
      is_publishable: publish_setting.readiness_status !== "blocked",
      blockers: publish_setting.readiness_status === "blocked" ? ["READINESS_BLOCKED"] : [],
      warnings: publish_setting.rights_check_status === "pending" ? ["RIGHTS_CHECK_PENDING"] : [],
    },
  };
}

export async function createPublishRequest(body: Record<string, unknown>) {
  const input = validateCreatePublishRequest(body);
  const publish_request = await insertPublishRequest({
    creator_publish_request_id: prefixedId("pr"),
    publish_ref: input.publish_ref,
    request_channel: "publish_now",
    request_status: "registered",
    execute_after: null,
    idempotency_key: crypto.randomUUID(),
  });

  return {
    publish_request: {
      ...publish_request,
      creator_project_id: input.creator_project_id,
      requested_by: input.requested_by,
      requested_at: publish_request.created_at,
    },
  };
}

export async function schedulePublish(body: Record<string, unknown>) {
  const input = validateSchedulePublish(body);
  const schedule = await updatePublishRequest(input.creator_publish_request_id, {
    request_channel: "schedule",
    request_status: "scheduled",
    execute_after: input.scheduled_publish_at,
  });

  return {
    schedule: {
      creator_publish_request_id: schedule.creator_publish_request_id,
      scheduled_publish_at: schedule.execute_after,
      scheduled_by: input.scheduled_by,
      registered_at: schedule.created_at,
    },
  };
}

export async function getPublishHistory(search: URLSearchParams) {
  const input = validatePublishHistory(search);
  const items = await listPublishHistory(input.creator_project_id, input.limit);
  return {
    items,
    page: {
      next_cursor: null,
      limit: input.limit,
    },
  };
}
