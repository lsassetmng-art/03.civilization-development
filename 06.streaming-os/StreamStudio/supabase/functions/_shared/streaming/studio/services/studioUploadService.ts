import { prefixedId } from "../common/ids.ts";
import { insertUploadJob, selectUploadJob, updateUploadJob } from "../repositories/studioUploadRepository.ts";
import { validateCompleteUpload, validateCreateUploadSession, validateRetryUpload } from "../validators/studioUploadValidator.ts";

export async function createUploadSession(body: Record<string, unknown>) {
  const input = validateCreateUploadSession(body);
  const creator_upload_job_id = prefixedId("up");
  const row = await insertUploadJob({
    creator_upload_job_id,
    creator_project_id: input.creator_project_id,
    resumable_session_ref: prefixedId("rus"),
    source_filename: input.source_file_name,
    file_size_bytes: input.file_size_bytes,
    ingest_status: "session_created",
    retry_count: 0,
  });
  return {
    upload_session: {
      creator_upload_job_id: row.creator_upload_job_id,
      resumable_session_ref: row.resumable_session_ref,
      ingest_status: row.ingest_status,
      upload_url: `/upload/${row.creator_upload_job_id}`,
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
      chunk_size_bytes: 5_242_880,
    },
  };
}

export async function completeUpload(creator_upload_job_id: string, body: Record<string, unknown>) {
  validateCompleteUpload(body);
  const upload_job = await updateUploadJob(creator_upload_job_id, {
    ingest_status: "uploaded",
  });
  return { upload_job };
}

export async function getUploadStatus(creator_upload_job_id: string) {
  const upload_job = await selectUploadJob(creator_upload_job_id);
  return {
    upload_job: {
      ...upload_job,
      progress_percent: upload_job.ingest_status === "ready" ? 100 : 75,
      failure_code: null,
      failure_summary: null,
    },
  };
}

export async function retryUpload(creator_upload_job_id: string, body: Record<string, unknown>) {
  validateRetryUpload(body);
  const current = await selectUploadJob(creator_upload_job_id);
  const upload_job = await updateUploadJob(creator_upload_job_id, {
    ingest_status: "retry_requested",
    retry_count: Number(current.retry_count ?? 0) + 1,
  });
  return { upload_job };
}
