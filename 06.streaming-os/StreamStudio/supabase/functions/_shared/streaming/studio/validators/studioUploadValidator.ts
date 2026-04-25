import { assert } from "../common/errors.ts";
import { optionalString, requiredString } from "../common/validation.ts";

export function validateCreateUploadSession(body: Record<string, unknown>) {
  const file_size_bytes = Number(body.file_size_bytes ?? 0);
  assert(Number.isFinite(file_size_bytes) && file_size_bytes >= 0, "INVALID_INPUT", "file_size_bytes must be >= 0");

  return {
    creator_project_id: requiredString(body.creator_project_id, "creator_project_id"),
    source_file_name: requiredString(body.source_file_name, "source_file_name"),
    file_size_bytes,
    mime_type: requiredString(body.mime_type, "mime_type"),
    target_asset_type: requiredString(body.target_asset_type, "target_asset_type"),
    checksum_sha256: optionalString(body.checksum_sha256),
  };
}

export function validateCompleteUpload(body: Record<string, unknown>) {
  return {
    final_chunk_received: Boolean(body.final_chunk_received),
    checksum_sha256: optionalString(body.checksum_sha256),
  };
}

export function validateRetryUpload(body: Record<string, unknown>) {
  return {
    retry_mode: requiredString(body.retry_mode, "retry_mode"),
  };
}
