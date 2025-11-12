import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";
import { currentWeekStart } from "lib/week";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { category } = await req.json();
  if (!category) return NextResponse.json({ error: "Missing category" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const week = currentWeekStart();
  const draft = await prisma.weeklySubmission.upsert({
    where: { userId_weekStart_category: { userId: user.id, weekStart: week, category } },
    update: {},
    create: { userId: user.id, weekStart: week, category },
  });
  return NextResponse.json({ submissionId: draft.id, weekStart: draft.weekStart, category: draft.category });
}
