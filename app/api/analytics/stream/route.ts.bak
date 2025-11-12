import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { trackId, eventType, msPlayed, device } = await req.json();
  if (!trackId || !eventType) return NextResponse.json({ error: "Missing" }, { status: 400 });
  await prisma.streamEvent.create({ data: { trackId, eventType, msPlayed, device } });
  return NextResponse.json({ ok: true });
}
