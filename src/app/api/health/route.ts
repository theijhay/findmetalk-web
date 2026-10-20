import { NextResponse } from "next/server";

/** Liveness for the deployment platform. Answers without the API. */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
