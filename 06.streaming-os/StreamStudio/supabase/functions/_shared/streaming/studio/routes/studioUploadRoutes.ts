import { handleError, ok, pathParts, readJson, type RouteHandler } from "../common/http.ts";
import { completeUpload, createUploadSession, getUploadStatus, retryUpload } from "../services/studioUploadService.ts";

export const tryHandleStudioUploadRoute: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);
    const parts = pathParts(req);

    if (req.method === "POST" && url.pathname === "/api/stream-studio/uploads/sessions") {
      return ok(req, await createUploadSession(await readJson(req)), 201);
    }

    if (parts.length >= 4 && parts[0] === "api" && parts[1] === "stream-studio" && parts[2] === "uploads") {
      const creator_upload_job_id = parts[3];

      if (req.method === "GET" && parts.length === 4) {
        return ok(req, await getUploadStatus(creator_upload_job_id));
      }
      if (req.method === "POST" && parts.length === 5 && parts[4] === "complete") {
        return ok(req, await completeUpload(creator_upload_job_id, await readJson(req)));
      }
      if (req.method === "POST" && parts.length === 5 && parts[4] === "retry") {
        return ok(req, await retryUpload(creator_upload_job_id, await readJson(req)));
      }
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
