import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      weeklySubmissions: {
        orderBy: { weekStart: "desc" },
        take: 12,
        select: {
          id: true,
          weekStart: true,
          category: true,
          status: true,
          _count: { select: { tracks: true } },
        },
      },
    },
  });
  if (!user) return NextResponse.json([]);

  const rows = user.weeklySubmissions.map(s => ({
    id: s.id,
    weekStart: s.weekStart,
    category: s.category,
    status: s.status,
    trackCount: s._count.tracks,
  }));
  return NextResponse.json(rows);
}
