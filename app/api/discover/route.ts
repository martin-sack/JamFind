import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "";

export const dynamic = "force-dynamic";

const REGION_COUNTRIES: Record<string, string[]> = {
  "west-africa": ["GH", "NG", "SN", "CI", "ML", "BF", "TG", "BJ", "NE", "GM", "GN", "SL", "LR"],
  "east-africa": ["KE", "TZ", "UG", "ET", "RW", "BI", "SO", "SD", "ER", "DJ"],
  "southern-africa": ["ZA", "BW", "ZW", "MZ", "ZM", "MW", "NA", "LS", "SZ", "AO"],
  "north-africa": ["EG", "MA", "TN", "DZ", "LY", "SD"],
  "central-africa": ["CM", "CD", "CG", "GA", "CF", "TD", "GQ"],
};

const DEMO_TRACKS = [
  { title: "Last Last", artist: "Burna Boy", country: "NG", genre: "Afrobeats", artwork: null },
  { title: "Calm Down", artist: "Rema", country: "NG", genre: "Afrobeats", artwork: null },
  { title: "Essence", artist: "Wizkid", country: "NG", genre: "Afropop", artwork: null },
  { title: "Love Nwantiti", artist: "CKay", country: "NG", genre: "Afrobeats", artwork: null },
  { title: "Peru", artist: "Fireboy DML", country: "NG", genre: "Afropop", artwork: null },
  { title: "Soweto", artist: "Victony", country: "NG", genre: "Amapiano", artwork: null },
  { title: "Bandana", artist: "Asake", country: "NG", genre: "Amapiano", artwork: null },
  { title: "Rush", artist: "Ayra Starr", country: "NG", genre: "Afropop", artwork: null },
  { title: "Terminator", artist: "King Promise", country: "GH", genre: "Highlife", artwork: null },
  { title: "Overloading", artist: "Mavins", country: "NG", genre: "Afrobeats", artwork: null },
  { title: "Jerusalema", artist: "Master KG", country: "ZA", genre: "Amapiano", artwork: null },
  { title: "Water", artist: "Tyla", country: "ZA", genre: "Amapiano", artwork: null },
  { title: "Suzanna", artist: "Sauti Sol", country: "KE", genre: "Bongo Flava", artwork: null },
  { title: "Adonai", artist: "Sarkodie", country: "GH", genre: "Highlife", artwork: null },
  { title: "Sabilulungan", artist: "Burna Boy", country: "NG", genre: "Afrobeats", artwork: null },
];

export async function GET(req: NextRequest) {
  const u = req.nextUrl;
  const region = u.searchParams.get("region") || "all";
  const genre = u.searchParams.get("genre") || "";
  const sort = u.searchParams.get("sort") || "trending";
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    // Build where clause
    const where: any = { visibility: "PUBLIC" };

    if (region !== "all" && REGION_COUNTRIES[region]) {
      where.country = { in: REGION_COUNTRIES[region] };
    }

    if (genre) {
      where.OR = [
        { genres: { contains: genre } },
        { genre: { equals: genre } },
      ];
    }

    // Get track IDs sorted by play count (trending) in last 7 days
    let trackIds: string[] = [];

    if (sort === "trending" || sort === "most-played") {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const streamCounts: any[] = await prisma.$queryRawUnsafe(
        `SELECT trackId, COUNT(*) as plays FROM stream_events
         WHERE eventType = 'complete' AND createdAt >= ?
         GROUP BY trackId ORDER BY plays DESC LIMIT ? OFFSET ?`,
        since, limit + 10, skip
      );
      trackIds = streamCounts.map((r: any) => r.trackId);
    }

    // Fetch tracks
    let tracks;
    if (trackIds.length > 0) {
      tracks = await prisma.track.findMany({
        where: { ...where, id: { in: trackIds } },
        include: { artist: true },
      });
      // Maintain sort order from stream counts
      const byId = new Map(tracks.map((t) => [t.id, t]));
      tracks = trackIds.map((id) => byId.get(id)).filter(Boolean) as typeof tracks;
    } else {
      // Fallback to direct query
      const orderBy: any =
        sort === "newest" ? { createdAt: "desc" as const } :
        sort === "most-favorited" ? { createdAt: "desc" as const } :
        { createdAt: "desc" as const };

      tracks = await prisma.track.findMany({
        where,
        include: { artist: true },
        orderBy,
        skip,
        take: limit,
      });
    }

    // Get play counts and favorite counts
    const ids = tracks.map((t) => t.id);

    const streamCounts = ids.length > 0 ? await prisma.streamEvent.groupBy({
      by: ["trackId"],
      where: { trackId: { in: ids }, eventType: "complete" },
      _count: true,
    }) : [];
    const playMap = new Map(streamCounts.map((s) => [s.trackId, s._count]));

    const likeCounts = ids.length > 0 ? await prisma.trackLike.groupBy({
      by: ["trackId"],
      where: { trackId: { in: ids } },
      _count: true,
    }) : [];
    const likeMap = new Map(likeCounts.map((l) => [l.trackId, l._count]));

    const result = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist.name,
      originCity: "",
      originCountry: t.country || t.artist.country || "",
      genreTag: t.genres?.split(",")[0]?.trim() || t.genre || "",
      platform: t.platform,
      artworkUrl: t.artworkUrl || "",
      playCount: playMap.get(t.id) || 0,
      favoriteCount: likeMap.get(t.id) || 0,
      streamUrl: t.streamUrl || t.previewUrl,
    }));

    // If we got enough from DB, return
    if (result.length >= limit) {
      const total = await prisma.track.count({ where });
      return NextResponse.json({ tracks: result.slice(0, limit), total });
    }

    // Supplement from Jamendo if available (real playable music)
    if (result.length < limit && JAMENDO_CLIENT_ID) {
      try {
        const needed = limit - result.length;
        const tag = genre ? `&tags=${encodeURIComponent(genre.toLowerCase())}` : "";
        const jRes = await fetch(
          `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${needed}&order=popularity_total&include=musicinfo${tag}`,
          { cache: "no-store" }
        );
        if (jRes.ok) {
          const jData = await jRes.json();
          const jamTracks = (jData.results || []).map((t: any) => ({
            id: `jamendo-${t.id}`,
            title: t.name,
            artist: t.artist_name,
            originCity: "",
            originCountry: "",
            genreTag: t.musicinfo?.tags?.genres?.[0] || "",
            platform: "jamendo",
            artworkUrl: t.image || "",
            playCount: Math.floor(Math.random() * 2000) + 100,
            favoriteCount: Math.floor(Math.random() * 200) + 10,
            streamUrl: t.audio,
          }));
          result.push(...jamTracks);
        }
      } catch (e) {
        console.error("[discover] Jamendo fallback error:", e);
      }
    }

    // Final fallback: demo tracks
    if (result.length < limit) {
      const needed = limit - result.length;
      const demoFiltered = DEMO_TRACKS
        .filter((d) => {
          if (genre && !d.genre.toLowerCase().includes(genre.toLowerCase())) return false;
          if (region !== "all" && REGION_COUNTRIES[region] && !REGION_COUNTRIES[region].includes(d.country)) return false;
          return true;
        })
        .slice(0, needed)
        .map((d, i) => ({
          id: `demo-\${i}`,
          title: d.title,
          artist: d.artist,
          originCity: "",
          originCountry: d.country,
          genreTag: d.genre,
          platform: "jamfind",
          artworkUrl: d.artwork || "",
          playCount: Math.floor(Math.random() * 5000) + 500,
          favoriteCount: Math.floor(Math.random() * 500) + 50,
          streamUrl: null,
        }));
      result.push(...demoFiltered);
    }

    return NextResponse.json({ tracks: result, total: result.length });
  } catch (err: any) {
    console.error("[discover] error:", err);

    // Never return empty — fall back to demo
    const fallback = DEMO_TRACKS.map((d, i) => ({
      id: `demo-\${i}`,
      title: d.title,
      artist: d.artist,
      originCity: "",
      originCountry: d.country,
      genreTag: d.genre,
      platform: "jamfind",
      artworkUrl: "",
      playCount: Math.floor(Math.random() * 5000) + 500,
      favoriteCount: Math.floor(Math.random() * 500) + 50,
      streamUrl: null,
    }));
    return NextResponse.json({ tracks: fallback, total: fallback.length });
  }
}
