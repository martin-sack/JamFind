import { prisma } from "lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  
  if (!q) return NextResponse.json({ tracks: [] });

  // Search local tracks
  const localTracks = await prisma.track.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { artist: { name: { contains: q } } as any },
      ],
    },
    take: 25,
    include: { artist: true },
  });

  const mappedLocal = localTracks.map(t => ({
    id: t.id,
    title: t.title,
    artworkUrl: t.artworkUrl ?? null,
    artistName: (t as any).artist?.name ?? "Unknown",
    streamHref: `/api/stream/${t.id}`,
    platform: "jamfind" as string,
    isLocal: true,
    externalUrl: t.externalUrl,
    duration: t.durationSec ? t.durationSec * 1000 : undefined,
  }));

  return NextResponse.json({ tracks: mappedLocal });
}
