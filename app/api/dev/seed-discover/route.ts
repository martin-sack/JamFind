import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  // If you already have tracks, skip; else create two demo tracks wired to your stream pipeline.
  const existing = await prisma.track.findMany({ take: 1 });
  if (!existing.length) {
    // First check if artist exists
    let artist = await prisma.artist.findFirst({
      where: { name: "Demo Artist" }
    });
    
    if (!artist) {
      artist = await prisma.artist.create({
        data: { 
          name: "Demo Artist",
          aka: "",
          chartedWeeks: ""
        }
      });
    }
    const t1 = await prisma.track.create({ 
      data: { 
        title: "Vibe Nation", 
        artistId: artist.id, 
        artworkUrl: null,
        genres: "afrobeats,pop",
        moods: "upbeat,happy"
      }
    });
    const t2 = await prisma.track.create({ 
      data: { 
        title: "Sunset Groove", 
        artistId: artist.id, 
        artworkUrl: null,
        genres: "afrobeats,chill",
        moods: "relaxed,chill"
      }
    });
    // Optional: enqueue transcode jobs if your upload pipeline exists
  }
  
  // Add a few completes so trending works
  const tracks = await prisma.track.findMany({ take: 2 });
  if (tracks.length >= 2) {
    await prisma.streamEvent.createMany({
      data: [
        { trackId: tracks[0].id, eventType: "complete" },
        { trackId: tracks[0].id, eventType: "complete" },
        { trackId: tracks[1].id, eventType: "complete" },
      ]
    });
  }
  
  return NextResponse.json({ ok: true, message: "Discover data seeded successfully" });
}
