import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) return NextResponse.json([]);

  // Show my actions and people I follow
  const followees = await prisma.userFollow.findMany({
    where: { followerId: me.id },
    select: { followeeId: true },
  });
  const ids = [me.id, ...followees.map(f => f.followeeId)];

  const feed = await prisma.activity.findMany({
    where: { userId: { in: ids } },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(feed.map(a => ({
    id: a.id,
    user: a.user?.name ?? "User",
    type: a.type,
    text: (a.metadata ? JSON.parse(a.metadata)?.text : null) ?? a.type,
    at: a.createdAt,
  })));
}
