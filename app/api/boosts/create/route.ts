import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { artistId, trackId, amountCents } = await req.json();
  const boost = await prisma.boost.create({
    data: { artistId, trackId, amountCents, status: "pending" }
  });
  return NextResponse.json({ boost });
}
