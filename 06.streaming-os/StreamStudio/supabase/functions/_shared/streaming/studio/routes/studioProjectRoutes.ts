import { handleError, ok, pathParts, readJson, type RouteHandler } from "../common/http.ts";
import { createProject, getProjectDetail, listProjects, updateProject } from "../services/studioProjectService.ts";

export const tryHandleStudioProjectRoute: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);
    const parts = pathParts(req);

    if (req.method === "POST" && url.pathname === "/api/stream-studio/projects") {
      return ok(req, await createProject(await readJson(req)), 201);
    }

    if (req.method === "GET" && url.pathname === "/api/stream-studio/projects") {
      return ok(req, await listProjects(url.searchParams));
    }

    if (parts.length === 4 && parts[0] === "api" && parts[1] === "stream-studio" && parts[2] === "projects") {
      const creator_project_id = parts[3];
      if (req.method === "GET") {
        return ok(req, await getProjectDetail(creator_project_id));
      }
      if (req.method === "PATCH") {
        return ok(req, await updateProject(creator_project_id, await readJson(req)));
      }
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
