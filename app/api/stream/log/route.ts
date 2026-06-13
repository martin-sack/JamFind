import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { trackId, platform } = await req.json();

    if (!trackId) {
      return NextResponse.json({ error: "trackId required" }, { status: 400 });
    }

    const device = req.headers.get("user-agent") || "unknown";

    await prisma.streamEvent.create({
      data: {
        trackId,
        eventType: "play",
        msPlayed: 0,
        device,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[stream/log] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
