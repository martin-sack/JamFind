import { prisma } from "lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ tracks: [] });

  // 1. Search local catalog
  const localTracks = await prisma.track.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { artist: { name: { contains: q } } as any },
      ],
    },
    take: 15,
    include: { artist: true },
  });

  const results = localTracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: (t as any).artist?.name ?? "Unknown",
    artworkUrl: t.artworkUrl ?? null,
    country: t.country || (t as any).artist?.country || null,
    genre: t.genres?.split(",")[0] || t.genre || null,
    platform: t.platform || "jamfind",
    externalId: t.externalId,
    streamUrl: t.streamUrl,
    isLocal: true,
  }));

  // 2. If few local results and Jamendo is configured, search there too
  if (results.length < 10 && JAMENDO_CLIENT_ID) {
    try {
      const jRes = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${encodeURIComponent(q)}&include=musicinfo`,
        { cache: "no-store" }
      );
      if (jRes.ok) {
        const jData = await jRes.json();
        const jamendoTracks = (jData.results || []).map((t: any) => ({
          id: `jamendo-${t.id}`,
          title: t.name,
          artist: t.artist_name,
          artworkUrl: t.image || null,
          country: null,
          genre: t.musicinfo?.tags?.genres?.[0] || null,
          platform: "jamendo",
          externalId: String(t.id),
          streamUrl: t.audio,
          isLocal: false,
        }));
        results.push(...jamendoTracks);
      }
    } catch (e) {
      console.error("[search] Jamendo error:", e);
    }
  }

  return NextResponse.json({ tracks: results });
}
