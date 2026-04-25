import { dispatchRoute } from "./routes/route_dispatch.js";

const PORT = Number(Deno.env.get("AIOD_PORT") || "8787");

Deno.serve({ port: PORT }, async (req: Request) => {
  return dispatchRoute(req);
});
