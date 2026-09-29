// PORTAL_AIWORKER_ROBOT_RENTAL_R1_R1
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const robotRentalStoreHtmlPath = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html";

export async function GET() {
  try {
    const html = await readFile(robotRentalStoreHtmlPath, "utf8");

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-portal-route": "aiworker-menu-robot-rental-store",
      },
    });
  } catch {
    return new Response(
      "<!doctype html><html lang=\"ja\"><head><meta charset=\"utf-8\"><title>RobotRentalStore</title></head><body><h1>RobotRentalStore</h1><p>画面ファイルを読み込めませんでした。</p></body></html>",
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }
}
