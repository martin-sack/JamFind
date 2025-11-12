import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const trackId = params.id;
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      artist: true
    }
  });
  
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }
  
  return NextResponse.json(track);
}
