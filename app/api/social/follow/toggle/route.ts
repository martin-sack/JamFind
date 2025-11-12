import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (me.id === userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const exists = await prisma.userFollow.findUnique({ where: { followerId_followeeId: { followerId: me.id, followeeId: userId }} }).catch(()=>null);
  if (exists) {
    await prisma.userFollow.delete({ where: { followerId_followeeId: { followerId: me.id, followeeId: userId } }});
    return NextResponse.json({ following: false });
  } else {
    await prisma.userFollow.create({ data: { followerId: me.id, followeeId: userId }});
    return NextResponse.json({ following: true });
  }
}
