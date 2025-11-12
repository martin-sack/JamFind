import { NextResponse } from "next/server";
import { getWeeklyTopPlaylists } from "lib/chartsPlaylists";
import dayjs from "dayjs";
import { prisma } from "lib/db";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getWeeklyTopPlaylists(100);
    await prisma.rankingSnapshot.create({
      data: {
        listType: "TOP_100_PLAYLISTS",
        weekStartDate: dayjs().startOf("week").toDate(),
        payloadJSON: JSON.stringify(
          data.map(d => ({ playlistId: d.playlistId, plays: d.plays }))
        )
      }
    });
    return NextResponse.json({ refreshed: true, count: data.length });
  } catch (error) {
    console.error('Update playlist charts error:', error);
    return NextResponse.json({ refreshed: false, count: 0, error: 'Database unavailable' }, { status: 200 });
  }
}
