import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 3) {
    return NextResponse.json({ error: "Query must be at least 3 characters" }, { status: 400 });
  }

  try {
    // SQLite uses LIKE which is case-insensitive for ASCII by default
    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { artist: { name: { contains: q } } },
          { genres: { contains: q } },
        ],
      },
      include: {
        artist: true,
        _count: { select: { playlistItems: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get like counts separately
    const trackIds = tracks.map((t) => t.id);
    const likeCounts = await prisma.trackLike.groupBy({
      by: ["trackId"],
      where: { trackId: { in: trackIds } },
      _count: true,
    });
    const likeMap = new Map(likeCounts.map((l) => [l.trackId, l._count]));

    // Get stream counts
    const streamCounts = await prisma.streamEvent.groupBy({
      by: ["trackId"],
      where: { trackId: { in: trackIds }, eventType: "complete" },
      _count: true,
    });
    const streamMap = new Map(streamCounts.map((s) => [s.trackId, s._count]));

    const results = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist.name,
      country: t.country || t.artist.country,
      genre: t.genres?.split(",")[0] || t.genre || undefined,
      artworkUrl: t.artworkUrl,
      playCount: streamMap.get(t.id) || 0,
      favoriteCount: likeMap.get(t.id) || 0,
      platform: t.platform,
      streamUrl: t.streamUrl,
      externalUrl: t.externalUrl,
    }));

    return NextResponse.json({ tracks: results, total: results.length });
  } catch (err: any) {
    console.error("[lyrics-search] error:", err);
    return NextResponse.json({ error: err?.message || "Search failed" }, { status: 500 });
  }
}
