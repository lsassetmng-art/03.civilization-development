import { NextResponse } from "next/server";
import { authPersistenceNotConnectedResponse } from "@/lib/auth-contract";

export async function POST() {
  return NextResponse.json(authPersistenceNotConnectedResponse(), { status: 501 });
}
