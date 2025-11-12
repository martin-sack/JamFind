import { NextResponse } from "next/server";
import { prisma } from "lib/db";
import dayjs from "dayjs";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET() {
  const weekStart = dayjs().startOf("week").toDate();
  const result = await prisma.$queryRawUnsafe<Array<{ trackId: string; plays: number }>>(`
    SELECT trackId, COUNT(*) AS plays
    FROM StreamEvent
    WHERE eventType='complete' AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY trackId
    ORDER BY plays DESC
    LIMIT 100;
  `);
  await prisma.rankingSnapshot.create({
    data: {
      weekStartDate: weekStart,
      listType: "TOP_100",
      payloadJSON: JSON.stringify(result)
    }
  });
  return NextResponse.json({ refreshed: true, count: result.length });
}
