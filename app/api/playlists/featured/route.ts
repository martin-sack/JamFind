import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get editorial user's public playlists
    const editorialUser = await prisma.user.findFirst({
      where: { email: "editorial@jamfind.dev" },
    });

    if (!editorialUser) {
      return NextResponse.json({ playlists: [] });
    }

    const playlists = await prisma.userPlaylist.findMany({
      where: { userId: editorialUser.id, isPublic: true },
      include: {
        tracks: {
          orderBy: { orderIndex: "asc" },
          take: 20,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = playlists.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      trackCount: p.tracks.length,
      coverArt: p.tracks[0]?.artworkUrl || null,
      tracks: p.tracks.map((t) => ({
        id: t.trackId || t.id,
        title: t.title,
        artist: t.artist,
        artworkUrl: t.artworkUrl,
      })),
    }));

    return NextResponse.json({ playlists: result });
  } catch (err: any) {
    console.error("[featured] error:", err);
    return NextResponse.json({ playlists: [] });
  }
}
