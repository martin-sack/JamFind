import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";
import { SUBMISSION_FEE_XP } from "lib/xp";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { submissionId } = await req.json();
  if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sub = await prisma.weeklySubmission.findUnique({
    where: { id: submissionId },
    include: { tracks: true },
  });
  if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (sub.tracks.length === 0) return NextResponse.json({ error: "Add at least 1 track" }, { status: 400 });
  if (user.xp < SUBMISSION_FEE_XP) return NextResponse.json({ error: "Insufficient XP", need: SUBMISSION_FEE_XP }, { status: 402 });

  // Deduct & submit atomically
  const [u2] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { xp: { decrement: SUBMISSION_FEE_XP } } }),
    prisma.weeklySubmission.update({ where: { id: sub.id }, data: { status: "submitted" } }),
  ]);

  return NextResponse.json({ ok: true, xp: u2.xp, fee: SUBMISSION_FEE_XP });
}
