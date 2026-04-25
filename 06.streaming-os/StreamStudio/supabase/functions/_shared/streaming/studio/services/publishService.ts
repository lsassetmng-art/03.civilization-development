import { assertCondition } from "../common/errors.ts";
import { validatePublishRequestChannel } from "../validators/projectValidators.ts";
import { listPublishHistory, registerPublishRequest } from "../repositories/publishRepository.ts";

export async function createPublishRequest(input: {
  publish_ref?: string;
  request_channel?: string;
  execute_after?: string | null;
}) {
  assertCondition(input.publish_ref && input.publish_ref.trim().length > 0, "VALIDATION_ERROR", "publish_ref is required", 422);
  const request_channel = validatePublishRequestChannel(input.request_channel);
  return await registerPublishRequest({
    publish_ref: input.publish_ref!.trim(),
    request_channel,
    execute_after: input.execute_after ?? null,
    idempotency_key: crypto.randomUUID()
  });
}

export async function readPublishHistory(query: URLSearchParams) {
  const limit = Number(query.get("limit") ?? "20");
  return {
    items: await listPublishHistory(limit),
    page: { next_cursor: null, limit }
  };
}
