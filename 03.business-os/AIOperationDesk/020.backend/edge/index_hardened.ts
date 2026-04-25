import { dispatchRouteHardened } from "./routes/route_dispatch_hardened.js";

const PORT = Number(Deno.env.get("AIOD_PORT") || "8787");

Deno.serve({ port: PORT }, async (req: Request) => {
  return dispatchRouteHardened(req);
});
