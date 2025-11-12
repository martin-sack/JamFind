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
  if (!me) return NextResponse.json({});

  // Top playlist of the week (most tracks & recent)
  const topPlaylist = await prisma.userPlaylist.findFirst({
    where: { isPublic: true },
    orderBy: [{ updatedAt: "desc" }],
    include: { _count: { select: { tracks: true } }, user: { select: { id: true, name: true } } },
  });

  // Trending category (most submissions in last 10 days)
  const since = new Date(Date.now() - 1000*60*60*24*10);
  const trending = await prisma.weeklySubmission.groupBy({
    by: ["category"],
    where: { weekStart: { gte: since } },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 1,
  });

  // Most liked track among followed users (approx via TrackLike count)
  const following = await prisma.userFollow.findMany({ where: { followerId: me.id }, select: { followeeId: true } });
  const followIds = following.map(f => f.followeeId);
  let mostLiked: any = null;
  if (followIds.length) {
    const liked = await prisma.trackLike.groupBy({
      by: ["trackId"],
      where: { userId: { in: followIds } },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 1,
    });
    if (liked.length) {
      mostLiked = { trackId: liked[0].trackId, likes: liked[0]._count.trackId };
    }
  }

  return NextResponse.json({
    topPlaylist: topPlaylist ? {
      id: topPlaylist.id,
      title: topPlaylist.title,
      owner: topPlaylist.user?.name ?? "User",
      tracks: topPlaylist._count.tracks,
    } : null,
    trendingCategory: trending[0]?.category ?? null,
    friendsMostLiked: mostLiked ?? null,
  });
}
