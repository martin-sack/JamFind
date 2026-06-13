import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";
import { currentWeekStart } from "lib/week";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sourceSubmissionId } = await req.json();
  if (!sourceSubmissionId) return NextResponse.json({ error: "Missing sourceSubmissionId" }, { status: 400 });

  const source = await prisma.weeklySubmission.findUnique({
    where: { id: sourceSubmissionId },
    include: { tracks: { orderBy: { orderIndex: "asc" } } },
  });
  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const week = currentWeekStart();

  const target = await prisma.weeklySubmission.upsert({
    where: { userId_weekStart_category: { userId: user.id, weekStart: week, category: source.category } },
    update: {},
    create: { userId: user.id, weekStart: week, category: source.category, status: "draft" },
  });

  // If target already has tracks, do not duplicate
  const existing = await prisma.submissionTrack.count({ where: { submissionId: target.id } });
  if (existing === 0) {
    await prisma.submissionTrack.createMany({
      data: source.tracks.slice(0, 10).map((t, i) => ({
        submissionId: target.id,
        orderIndex: i,
        title: t.title,
        artist: t.artist,
        artworkUrl: t.artworkUrl,
        trackId: t.trackId,
        source: t.source,
        sourceId: t.sourceId,
      })),
    });
  }

  return NextResponse.json({ ok: true, submissionId: target.id });
}
