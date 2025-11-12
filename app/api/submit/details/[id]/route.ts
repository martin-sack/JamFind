import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await prisma.weeklySubmission.findUnique({
    where: { id: params.id },
    include: { tracks: { orderBy: { orderIndex: "asc" } } },
  });
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: s.id,
    weekStart: s.weekStart,
    category: s.category,
    status: s.status,
    tracks: s.tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      artworkUrl: t.artworkUrl,
      trackId: t.trackId,               // if exists in JamFind
      streamHref: t.trackId ? `/api/stream/${t.trackId}` : null,
      source: t.source,
    })),
  });
}
