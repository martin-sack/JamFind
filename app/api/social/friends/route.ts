import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) return NextResponse.json([]);

  const rows = await prisma.userFollow.findMany({
    where: { followerId: me.id },
    include: {
      followee: {
        select: {
          id: true, name: true, email: true, profileImage: true,
          userPlaylists: { where: { isPublic: true }, select: { id: true, title: true, _count: { select: { tracks: true } } }, take: 3, orderBy: { updatedAt: "desc" } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return NextResponse.json(rows.map(r => ({
    id: r.followee.id,
    name: r.followee.name ?? r.followee.email,
    image: r.followee.profileImage ?? null,
    playlists: r.followee.userPlaylists,
  })));
}
