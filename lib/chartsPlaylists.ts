import { prisma } from "./db";
import dayjs from "dayjs";

/**
 * We'll support BOTH schemas:
 *  A) join-table: PlaylistTrack { playlistId, trackId }
 *  B) direct: Track { playlistId }
 * We'll try A first, then fall back to B.
 */
export type PlaylistChartRow = {
  rank: number;
  prevRank?: number | null;
  delta?: number | null;         // + means moved up
  plays: number;
  playlistId: string;
  playlistTitle: string;
  coverUrl?: string | null;
  ownerName: string;             // "from who"
};

async function latestSnapshot(type: string) {
  return prisma.rankingSnapshot.findFirst({
    where: { listType: type },
    orderBy: { createdAt: "desc" },
  });
}

async function previousSnapshot(type: string, before?: Date) {
  return prisma.rankingSnapshot.findFirst({
    where: { listType: type, createdAt: { lt: before ?? new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWeeklyTopPlaylists(limit = 100): Promise<PlaylistChartRow[]> {
  // Snapshots labeled for playlists:
  const LIST_TYPE = "TOP_100_PLAYLISTS";
  const latest = await latestSnapshot(LIST_TYPE);
  const previous = await previousSnapshot(LIST_TYPE, latest?.createdAt);

  let rows: { playlistId: string; plays: number }[] = [];

  if (latest?.payloadJSON) {
    rows = JSON.parse(latest.payloadJSON);
  } else {
    // live fallback: last 7 days completed streams → aggregate by playlist
    const since = dayjs().subtract(7, "day").toDate();

    // Try join-table first (PlaylistTrack)
    try {
      const rawA: any[] = await prisma.$queryRaw`
        SELECT pt.playlistId AS playlistId, COUNT(se.id) AS plays
        FROM StreamEvent se
        JOIN Track t ON t.id = se.trackId
        JOIN PlaylistTrack pt ON pt.trackId = t.id
        WHERE se.eventType = 'complete' AND se.createdAt >= ${since}
        GROUP BY pt.playlistId
        ORDER BY plays DESC
        LIMIT ${limit};
      `;
      if (rawA.length) {
        rows = rawA.map(r => ({ playlistId: r.playlistId, plays: Number(r.plays) }));
      }
    } catch (_) {
      // ignore
    }

    // Fallback to direct Track.playlistId
    if (!rows.length) {
      const rawB: any[] = await prisma.$queryRaw`
        SELECT t.playlistId AS playlistId, COUNT(se.id) AS plays
        FROM StreamEvent se
        JOIN Track t ON t.id = se.trackId
        WHERE se.eventType = 'complete' AND se.createdAt >= ${since} AND t.playlistId IS NOT NULL
        GROUP BY t.playlistId
        ORDER BY plays DESC
        LIMIT ${limit};
      `;
      rows = rawB
        .filter(r => r.playlistId) // safety
        .map(r => ({ playlistId: r.playlistId as string, plays: Number(r.plays) }));
    }
  }

  if (!rows.length) return [];

  const playlistIds = rows.map(r => r.playlistId);
  // Try to pull owner's display name (support either creator User or Artist)
  const playlists = await prisma.playlist.findMany({
    where: { id: { in: playlistIds } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          handle: true,
        }
      },
    },
  });

  const byId = Object.fromEntries(playlists.map(p => [p.id, p]));

  // previous index for delta computation
  const prevIndex: Record<string, number> = {};
  if (previous?.payloadJSON) {
    const prevRows: { playlistId: string }[] = JSON.parse(previous.payloadJSON);
    prevRows.forEach((r, i) => { prevIndex[r.playlistId] = i + 1; });
  }

  return rows.map((r, i) => {
    const p = byId[r.playlistId];
    const rank = i + 1;
    const prevRank = prevIndex[r.playlistId] ?? null;
    const delta = prevRank ? (prevRank - rank) : null; // + up, - down
    const ownerName = p?.user?.name || p?.user?.handle || "Unknown";
    return {
      rank,
      prevRank,
      delta,
      plays: r.plays,
      playlistId: r.playlistId,
      playlistTitle: p?.title || r.playlistId,
      coverUrl: null, // Playlist doesn't have coverUrl in schema
      ownerName,
    };
  });
}
