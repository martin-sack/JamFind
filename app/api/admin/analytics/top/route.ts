import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export const runtime = "nodejs";

export async function GET() {
  const topTracks = await prisma.$queryRawUnsafe<Array<{ trackId: string; plays: bigint }>>(`
    SELECT trackId, COUNT(*) AS plays
    FROM stream_events
    WHERE eventType='complete'
    GROUP BY trackId
    ORDER BY plays DESC
    LIMIT 10;
  `);
  
  // Convert BigInt to regular numbers
  const convertedTracks = topTracks.map(track => ({
    trackId: track.trackId,
    plays: Number(track.plays)
  }));
  
  return NextResponse.json({ topTracks: convertedTracks });
}
