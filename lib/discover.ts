import dayjs from "dayjs";
import { prisma } from "lib/db";

export type DiscoverItem = {
  id: string;
  title: string;
  artworkUrl: string | null;
  artistName: string;
  streamHref: string; // signed HLS route
};

function mapTrack(t: any): DiscoverItem {
  return {
    id: t.id,
    title: t.title,
    artworkUrl: t.artworkUrl ?? null,
    artistName: t.artist?.name ?? "Unknown",
    streamHref: `/api/stream/${t.id}`,
  };
}

export async function getTrending(limit = 24): Promise<DiscoverItem[]> {
  const since = dayjs().subtract(7, "day").toDate();
  
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT t.id, COUNT(se.id) as plays
      FROM StreamEvent se
      JOIN Track t ON t.id = se.trackId
      WHERE se.eventType='complete' AND se.createdAt >= ?
      GROUP BY t.id
      ORDER BY plays DESC
      LIMIT ?;
    `, since as any, limit as any);
    
    if (!rows.length) {
      // fallback: recent tracks
      const latest = await prisma.track.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { artist: true },
      });
      return latest.map(mapTrack);
    }
    
    const ids = rows.map(r => r.id);
    const tracks = await prisma.track.findMany({
      where: { id: { in: ids } },
      include: { artist: true },
    });
    const byId = Object.fromEntries(tracks.map(t => [t.id, t]));
    return ids.map((id: string) => mapTrack(byId[id]));
  } catch (error) {
    console.error("Error fetching trending tracks:", error);
    // fallback: recent tracks
    const latest = await prisma.track.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { artist: true },
    });
    return latest.map(mapTrack);
  }
}

export async function getForYou(userId: string | null, limit = 24): Promise<DiscoverItem[]> {
  // basic starter: same as trending for now, swap later with taste model
  return getTrending(limit);
}
