import { NextResponse } from "next/server";
import { getWeeklyTopPlaylists } from "lib/chartsPlaylists";
import dayjs from "dayjs";
import { prisma } from "lib/db";

export const runtime = "nodejs";

export async function GET() {
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
}
