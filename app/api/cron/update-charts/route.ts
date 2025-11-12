import { NextResponse } from "next/server";
import { prisma } from "lib/db";
import dayjs from "dayjs";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Update charts error:', error);
    return NextResponse.json({ refreshed: false, count: 0, error: 'Database unavailable' }, { status: 200 });
  }
}
