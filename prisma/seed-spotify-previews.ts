import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";

async function getSpotifyToken(): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Spotify auth failed: " + JSON.stringify(data));
  return data.access_token;
}

async function searchSpotify(token: string, title: string, artist: string) {
  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=3`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.tracks?.items?.[0] || null;
}

async function main() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env");
    process.exit(1);
  }

  console.log("Fetching Spotify token...");
  const token = await getSpotifyToken();
  console.log("Authenticated with Spotify\n");

  const tracks = await prisma.track.findMany({
    where: { previewUrl: null },
    include: { artist: true },
  });

  console.log(`Found ${tracks.length} tracks without preview URLs\n`);

  let updated = 0;
  let skipped = 0;

  for (const track of tracks) {
    const result = await searchSpotify(token, track.title, track.artist.name);

    if (!result) {
      console.log(`  SKIP: ${track.title} by ${track.artist.name} — not found on Spotify`);
      skipped++;
      continue;
    }

    const previewUrl = result.preview_url;
    const artworkUrl = result.album?.images?.[0]?.url || result.album?.images?.[1]?.url;
    const spotifyId = result.id;
    const durationMs = result.duration_ms;

    const updateData: any = {};
    if (previewUrl) updateData.previewUrl = previewUrl;
    if (artworkUrl && !track.artworkUrl) updateData.artworkUrl = artworkUrl;
    if (spotifyId) updateData.externalId = spotifyId;
    if (durationMs) updateData.durationSec = Math.round(durationMs / 1000);
    if (!track.externalUrl && result.external_urls?.spotify) {
      updateData.externalUrl = result.external_urls.spotify;
    }

    if (Object.keys(updateData).length === 0) {
      console.log(`  SKIP: ${track.title} — Spotify has no preview`);
      skipped++;
      continue;
    }

    await prisma.track.update({ where: { id: track.id }, data: updateData });
    updated++;

    const has = [];
    if (updateData.previewUrl) has.push("audio");
    if (updateData.artworkUrl) has.push("artwork");
    if (updateData.durationSec) has.push(updateData.durationSec + "s");
    console.log(`  OK: ${track.title} by ${track.artist.name} [${has.join(", ")}]`);

    // Rate limit: 1 request per 100ms
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);

  // Summary
  const withPreview = await prisma.track.count({ where: { previewUrl: { not: null } } });
  const withArt = await prisma.track.count({ where: { artworkUrl: { not: null } } });
  const total = await prisma.track.count();
  console.log(`\nCatalog: ${total} tracks, ${withPreview} with audio preview, ${withArt} with artwork`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
