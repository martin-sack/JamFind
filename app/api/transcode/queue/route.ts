import { NextRequest, NextResponse } from "next/server";
import { transcodeQueue } from "../../../../lib/queue";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { trackId, sourceKey } = await req.json();
  if (!trackId || !sourceKey) return NextResponse.json({ error: "Missing" }, { status: 400 });
  await transcodeQueue.add("transcode", { trackId, sourceKey });
  return NextResponse.json({ queued: true });
}
