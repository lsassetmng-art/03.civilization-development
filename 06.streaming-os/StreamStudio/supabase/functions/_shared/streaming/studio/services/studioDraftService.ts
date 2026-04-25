import { prefixedId } from "../common/ids.ts";
import { insertDraft, updateDraft } from "../repositories/studioDraftRepository.ts";
import { validateCreateDraft, validateUpdateDraftMetadata } from "../validators/studioDraftValidator.ts";

export async function createVideoDraft(body: Record<string, unknown>) {
  const input = validateCreateDraft(body);
  const video_draft = await insertDraft({
    creator_video_draft_id: prefixedId("vd"),
    creator_project_id: input.creator_project_id,
    asset_ref: input.asset_ref,
    draft_title: input.title,
    draft_summary: input.description,
    draft_status: "editing",
    version: 1,
  });
  return {
    video_draft: {
      creator_video_draft_id: video_draft.creator_video_draft_id,
      creator_project_id: video_draft.creator_project_id,
      asset_ref: video_draft.asset_ref,
      draft_status: video_draft.draft_status,
      title: video_draft.draft_title,
      description: video_draft.draft_summary,
      default_language: input.default_language,
      draft_version: video_draft.version,
      created_at: video_draft.created_at,
      updated_at: video_draft.updated_at,
    },
  };
}

export async function updateMetadata(creator_video_draft_id: string, body: Record<string, unknown>) {
  const input = validateUpdateDraftMetadata(body);
  const video_draft = await updateDraft(creator_video_draft_id, {
    draft_title: input.title,
    draft_summary: input.description,
  });
  return {
    video_draft: {
      creator_video_draft_id: video_draft.creator_video_draft_id,
      title: video_draft.draft_title,
      description: video_draft.draft_summary,
      draft_version: video_draft.version,
      updated_at: video_draft.updated_at,
    },
  };
}
