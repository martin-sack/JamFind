import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const artistId = params.id;
  const tracks = await prisma.track.findMany({
    where: { artistId }
  });
  return NextResponse.json({ tracks });
}
