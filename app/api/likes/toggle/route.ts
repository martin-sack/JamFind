import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "Missing trackId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const exists = await prisma.trackLike.findUnique({ where: { userId_trackId: { userId: user.id, trackId } } }).catch(()=>null);
  if (exists) {
    await prisma.trackLike.delete({ where: { userId_trackId: { userId: user.id, trackId } } });
    return NextResponse.json({ liked: false });
  }
  await prisma.trackLike.create({ data: { userId: user.id, trackId } });
  return NextResponse.json({ liked: true });
}
