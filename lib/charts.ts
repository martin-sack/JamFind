import { prisma } from "lib/db";
import dayjs from "dayjs";

export type ChartRow = {
  rank: number;
  prevRank?: number | null;
  delta?: number | null; // + means moved UP
  plays: number;
  trackId: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
};

export async function getWeeklyTop(limit = 100): Promise<ChartRow[]> {
  const latest = await prisma.rankingSnapshot.findFirst({
    where: { listType: "TOP_100" },
    orderBy: { createdAt: "desc" },
  });
  const previous = await prisma.rankingSnapshot.findFirst({
    where: { listType: "TOP_100", createdAt: { lt: latest?.createdAt ?? new Date() } },
    orderBy: { createdAt: "desc" },
  });

  let rows: { trackId: string; plays: number }[] = [];
  if (latest?.payloadJSON) {
    rows = JSON.parse(latest.payloadJSON);
  } else {
    const since = dayjs().subtract(7, "day").toDate();
    const raw: any[] = await prisma.$queryRawUnsafe(`
      SELECT trackId, COUNT(*) AS plays
      FROM stream_events
      WHERE eventType='complete' AND createdAt >= ?
      GROUP BY trackId
      ORDER BY plays DESC
      LIMIT ?;
    `, since as any, limit as any);
    rows = raw.map(r => ({ trackId: r.trackId, plays: Number(r.plays) }));
  }

  const trackIds = rows.map(r => r.trackId);
  const tracks = await prisma.track.findMany({
    where: { id: { in: trackIds } },
    include: { artist: true },
  });
  const byId = Object.fromEntries(tracks.map(t => [t.id, t]));

  const prevIndex: Record<string, number> = {};
  if (previous?.payloadJSON) {
    const prevRows: { trackId: string }[] = JSON.parse(previous.payloadJSON);
    prevRows.forEach((r, i) => { prevIndex[r.trackId] = i + 1; });
  }

  return rows.slice(0, limit).map((r, i) => {
    const rank = i + 1;
    const prevRank = prevIndex[r.trackId] ?? null;
    const delta = prevRank ? (prevRank - rank) : null; // + = up
    const t = byId[r.trackId];
    return {
      rank, prevRank, delta,
      plays: r.plays,
      trackId: r.trackId,
      title: t?.title ?? r.trackId,
      artist: t?.artist?.name ?? "Unknown",
      artworkUrl: t?.artworkUrl ?? null,
    };
  });
}
