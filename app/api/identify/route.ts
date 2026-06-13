import { NextRequest, NextResponse } from "next/server";
import { identifyAudio } from "@/lib/acrcloud";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { audio } = await req.json();

    if (!audio || typeof audio !== "string") {
      return NextResponse.json(
        { error: "audio (base64) is required" },
        { status: 400 }
      );
    }

    const result = await identifyAudio(audio);

    if (!result.found) {
      return NextResponse.json({ found: false });
    }

    // Check if the track exists in our catalog
    let inCatalog = false;
    let trackId: string | undefined;

    if (result.title && result.artist) {
      const track = await prisma.track.findFirst({
        where: {
          title: { contains: result.title },
          artist: { name: { contains: result.artist } },
        },
      });

      if (track) {
        inCatalog = true;
        trackId = track.id;
      }
    }

    return NextResponse.json({
      found: true,
      title: result.title,
      artist: result.artist,
      album: result.album,
      genre: result.genre,
      inCatalog,
      trackId,
    });
  } catch {
    return NextResponse.json(
      { error: "Identification failed" },
      { status: 500 }
    );
  }
}
