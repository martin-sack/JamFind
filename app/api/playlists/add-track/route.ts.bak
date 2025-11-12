import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { playlistId, track } = await req.json();
  // track: { trackId?; title; artist; artworkUrl? }
  if (!playlistId || !track?.title || !track?.artist) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const count = await prisma.userPlaylistTrack.count({ where: { playlistId } });
  const row = await prisma.userPlaylistTrack.create({
    data: {
      playlistId,
      orderIndex: count,
      trackId: track.trackId ?? null,
      title: track.title,
      artist: track.artist,
      artworkUrl: track.artworkUrl ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: row.id });
}
