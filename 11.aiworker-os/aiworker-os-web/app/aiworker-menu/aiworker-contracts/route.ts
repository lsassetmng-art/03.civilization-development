import { readFile } from "node:fs/promises";

export const dynamic = "force-dynamic";

const CONTRACTS_HTML_PATH =
  "/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/contracts.html";

export async function GET() {
  const html = await readFile(CONTRACTS_HTML_PATH, "utf8");

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
