import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { playlistTrackId } = await req.json();
  if (!playlistTrackId) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const row = await prisma.userPlaylistTrack.delete({ where: { id: playlistTrackId } });
  // reindex
  const rows = await prisma.userPlaylistTrack.findMany({ where: { playlistId: row.playlistId }, orderBy: { orderIndex: "asc" } });
  await Promise.all(rows.map((r, i) => prisma.userPlaylistTrack.update({ where: { id: r.id }, data: { orderIndex: i } })));
  return NextResponse.json({ ok: true });
}
