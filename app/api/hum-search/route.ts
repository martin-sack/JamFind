import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AUDD_API_TOKEN = process.env.AUDD_API_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio } = body;

    if (!audio || typeof audio !== "string") {
      return NextResponse.json({ error: "audio (base64) is required" }, { status: 400 });
    }

    if (!AUDD_API_TOKEN) {
      return NextResponse.json({ found: false, error: "AudD API token not configured" });
    }

    const form = new FormData();
    form.append("api_token", AUDD_API_TOKEN);
    form.append("audio", audio);
    form.append("return", "apple_music,spotify");

    const response = await fetch("https://api.audd.io/recognize/", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      return NextResponse.json({ found: false, error: `AudD HTTP ${response.status}` });
    }

    const data = await response.json();

    if (!data?.result) {
      return NextResponse.json({ found: false, inCatalog: false });
    }

    const r = data.result;
    const title = r.title || "";
    const artist = r.artist || "";

    // Catalog lookup
    let catalogTrack = null;
    try {
      const tracks = await prisma.track.findMany({
        where: { title: { equals: title } },
        include: { artist: true },
        take: 5,
      });
      catalogTrack =
        tracks.find((t) => t.artist.name.toLowerCase() === artist.toLowerCase()) ??
        tracks[0] ??
        null;
    } catch (dbErr) {
      console.error("[hum-search] DB lookup error:", dbErr);
    }

    return NextResponse.json({
      found: true,
      title,
      artist,
      album: r.album || undefined,
      genre: r.song_link || undefined,
      inCatalog: !!catalogTrack,
      track: catalogTrack
        ? {
            id: catalogTrack.id,
            title: catalogTrack.title,
            artist: catalogTrack.artist.name,
            artworkUrl: catalogTrack.artworkUrl,
            genres: catalogTrack.genres,
            streamUrl: catalogTrack.streamUrl,
            platform: catalogTrack.platform,
            externalUrl: catalogTrack.externalUrl,
          }
        : undefined,
    });
  } catch (err: any) {
    console.error("[hum-search] error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
