import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export async function POST(req: Request) {
  const { submissionId, items } = await req.json(); // items: array of {title, artist, artworkUrl?, trackId?, source?, sourceId?}
  if (!submissionId || !Array.isArray(items)) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

  const count = await prisma.submissionTrack.count({ where: { submissionId } });
  const remaining = Math.max(0, 10 - count);
  const toInsert = items.slice(0, remaining).map((it: any, idx: number) => ({
    submissionId,
    orderIndex: count + idx,
    title: it.title,
    artist: it.artist,
    artworkUrl: it.artworkUrl ?? null,
    trackId: it.trackId ?? null,
    source: it.source ?? null,
    sourceId: it.sourceId ?? null,
  }));
  if (!toInsert.length) return NextResponse.json({ ok: true, inserted: 0, remaining: 0 });
  await prisma.submissionTrack.createMany({ data: toInsert });
  const newCount = await prisma.submissionTrack.count({ where: { submissionId } });
  return NextResponse.json({ ok: true, inserted: toInsert.length, total: newCount, remaining: Math.max(0, 10 - newCount) });
}

export async function DELETE(req: Request) {
  const { submissionId, id } = await req.json();
  if (!submissionId || !id) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  await prisma.submissionTrack.delete({ where: { id } });
  // reindex
  const rows = await prisma.submissionTrack.findMany({ where: { submissionId }, orderBy: { orderIndex: "asc" } });
  await Promise.all(rows.map((r, i) => prisma.submissionTrack.update({ where: { id: r.id }, data: { orderIndex: i } })));
  return NextResponse.json({ ok: true });
}
