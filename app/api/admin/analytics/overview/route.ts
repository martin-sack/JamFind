import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalTracks = await prisma.track.count();
    const totalStreams = await prisma.streamEvent.count();
    const totalTips = await prisma.tippingTransaction.aggregate({ _sum: { amountCents: true } });

    return NextResponse.json({
      totalUsers,
      totalTracks,
      totalStreams,
      totalTipAmount: totalTips._sum.amountCents || 0
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({
      totalUsers: 0,
      totalTracks: 0,
      totalStreams: 0,
      totalTipAmount: 0
    }, { status: 200 });
  }
}
