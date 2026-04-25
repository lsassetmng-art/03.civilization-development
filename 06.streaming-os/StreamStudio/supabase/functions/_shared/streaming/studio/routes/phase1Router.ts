import { ok, readJson } from "../common/http.ts";
import { createProject, readProjectDetail, readProjectList } from "../services/projectService.ts";
import { createPublishRequest, readPublishHistory } from "../services/publishService.ts";

export async function routeStudioPhase1(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === "POST" && pathname === "/api/stream-studio/projects") {
    const body = await readJson(req);
    return ok(req, { project: await createProject(body) }, 201);
  }

  if (req.method === "GET" && pathname === "/api/stream-studio/projects") {
    return ok(req, await readProjectList(url.searchParams));
  }

  if (req.method === "GET" && pathname.startsWith("/api/stream-studio/projects/")) {
    const creator_project_id = pathname.split("/").pop()!;
    return ok(req, await readProjectDetail(creator_project_id));
  }

  if (req.method === "POST" && pathname === "/api/stream-studio/publish-requests") {
    const body = await readJson(req);
    return ok(req, { publish_request: await createPublishRequest(body) }, 201);
  }

  if (req.method === "GET" && pathname === "/api/stream-studio/publish-history") {
    return ok(req, await readPublishHistory(url.searchParams));
  }

  return null;
}
