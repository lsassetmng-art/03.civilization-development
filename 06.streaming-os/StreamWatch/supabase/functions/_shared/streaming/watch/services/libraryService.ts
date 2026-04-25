import { buildLibrary, resolveEntitlement } from "../repositories/projectionAdapters.ts";
import { coercePositiveLimit, ensureSection, requireTargetId, requireTargetType, requireViewerProfileId } from "../validators/commonValidators.ts";

export async function readLibrary(input: {
  viewer_profile_id?: string;
  section?: string;
  limit?: number;
  offset?: number;
}) {
  return await buildLibrary({
    viewer_profile_id: requireViewerProfileId(input.viewer_profile_id),
    section: ensureSection(input.section),
    limit: coercePositiveLimit(input.limit, 20),
    offset: Number(input.offset ?? 0)
  });
}

export async function readEntitlement(input: {
  target_type?: string;
  target_id?: string;
}) {
  return await resolveEntitlement({
    target_type: requireTargetType(input.target_type),
    target_id: requireTargetId(input.target_id)
  });
}

export async function followUpsert() {
  return { result: "ok", follow_state: "adapter_stub" };
}

export async function savedListMutate(input: { list_type?: string; mutation?: string }) {
  return {
    result: "ok",
    list_type: input.list_type ?? "watch_later",
    mutation: input.mutation ?? "upsert",
    backing_mode: "deferred_adapter_stub"
  };
}

export async function watchQueueMutate(input: { mutation?: string }) {
  return {
    result: "ok",
    queue_state: input.mutation ?? "upsert",
    backing_mode: "deferred_adapter_stub"
  };
}
