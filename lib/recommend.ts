import { prisma } from "lib/db";

export async function getRecommendations(userId: string) {
  try {
    // 1. find user's most-played genres
    const topGenres = await prisma.$queryRawUnsafe<Array<{ genres: string; c: bigint }>>(`
      SELECT t.genres, COUNT(*) AS c
      FROM stream_events s
      JOIN tracks t ON s.trackId = t.id
      WHERE s.userId = '${userId}'
      GROUP BY t.genres
      ORDER BY c DESC
      LIMIT 3;
    `);

    // If user has no listening history, return popular tracks
    if (topGenres.length === 0) {
      const popularTracks = await prisma.track.findMany({
        where: { visibility: "PUBLIC" },
        take: 10,
        orderBy: { createdAt: "desc" }
      });
      return popularTracks;
    }

    // 2. fetch random tracks matching those genres
    const genreList = topGenres.map(g => g.genres);
    const recs = await prisma.track.findMany({
      where: { 
        genres: { in: genreList }, 
        visibility: "PUBLIC" 
      },
      include: {
        artist: true
      },
      take: 10
    });

    // If not enough genre-matched tracks, supplement with popular tracks
    if (recs.length < 10) {
      const additionalTracks = await prisma.track.findMany({
        where: { 
          visibility: "PUBLIC",
          genres: { notIn: genreList } // Avoid duplicates
        },
        include: {
          artist: true
        },
        take: 10 - recs.length,
        orderBy: { createdAt: "desc" }
      });
      recs.push(...additionalTracks);
    }

    return recs;
  } catch (error) {
    console.error(`[Recommendation Engine] Error for user ${userId}:`, error);
    
    // Fallback: return recent public tracks
    const fallbackTracks = await prisma.track.findMany({
      where: { visibility: "PUBLIC" },
      include: {
        artist: true
      },
      take: 10,
      orderBy: { createdAt: "desc" }
    });
    
    return fallbackTracks;
  }
}
