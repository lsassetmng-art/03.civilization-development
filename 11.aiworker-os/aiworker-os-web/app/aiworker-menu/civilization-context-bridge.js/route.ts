import { readFile } from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const civilizationContextBridgePath =
  `${process.cwd()}/public/robot-rental-store-ui/civilization-context-bridge.js`;

export async function GET() {
  try {
    const javascript = await readFile(
      civilizationContextBridgePath,
      "utf8",
    );

    return new Response(javascript, {
      status: 200,
      headers: {
        "content-type": "text/javascript; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
