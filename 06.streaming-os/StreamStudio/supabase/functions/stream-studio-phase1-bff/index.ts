import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { routeStudioPhase1 } from "../_shared/streaming/studio/routes/phase1Router.ts";
import { fail, handleError } from "../_shared/streaming/studio/common/http.ts";

serve(async (req) => {
  try {
    const routed = await routeStudioPhase1(req);
    if (routed) return routed;
    return fail(req, "NOT_FOUND", `No route matched: ${req.method} ${new URL(req.url).pathname}`, undefined, 404);
  } catch (error) {
    return handleError(req, error);
  }
});
