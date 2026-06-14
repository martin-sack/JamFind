import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "";

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  album_name: string;
  image: string;
  audio: string;
  duration: number;
  musicinfo?: { tags?: { genres?: string[]; instruments?: string[] } };
}

// Playlists to seed — each searches Jamendo with specific tags
const PLAYLISTS = [
  {
    title: "Afrobeats Essentials",
    description: "The sound of West Africa — grooves, percussion, and pure energy",
    tags: "afrobeat",
    boost: ["african", "world"],
    mood: "Energetic",
  },
  {
    title: "Chill Africa",
    description: "Smooth sounds from across the continent for winding down",
    tags: "african+chillout",
    boost: ["ambient", "relaxing"],
    mood: "Chill",
  },
  {
    title: "African Rhythms",
    description: "Drums, percussion, and the heartbeat of the continent",
    tags: "african+drums",
    boost: ["percussion", "tribal"],
    mood: "Energetic",
  },
  {
    title: "World Fusion",
    description: "Where African sounds meet global influences",
    tags: "world+fusion",
    boost: ["african", "jazz"],
    mood: "Uplifting",
  },
  {
    title: "Late Night Vibes",
    description: "Moody, atmospheric tracks for after midnight",
    tags: "african+soul",
    boost: ["rnb", "soul"],
    mood: "Romantic",
  },
  {
    title: "Highlife & Beyond",
    description: "Classic West African highlife and its modern descendants",
    tags: "highlife",
    boost: ["african", "guitar"],
    mood: "Uplifting",
  },
];

async function fetchJamendoTracks(tags: string, limit = 15): Promise<JamendoTrack[]> {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=${limit}&order=popularity_total&tags=${encodeURIComponent(tags)}&include=musicinfo&audiodlformat=mp32`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  Jamendo API error: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.results || [];
}

async function main() {
  if (!CLIENT_ID) {
    console.error("Set JAMENDO_CLIENT_ID in .env first");
    process.exit(1);
  }

  console.log("Seeding full-length Jamendo tracks + editorial playlists\n");

  // Create or find editorial user
  let editorialUser = await prisma.user.findFirst({ where: { email: "editorial@jamfind.dev" } });
  if (!editorialUser) {
    editorialUser = await prisma.user.create({
      data: { email: "editorial@jamfind.dev", name: "JamFind Editorial", role: "ADMIN" },
    });
    console.log("Created editorial user\n");
  }

  let totalTracks = 0;

  for (const pl of PLAYLISTS) {
    console.log(`\n--- ${pl.title} ---`);

    // Fetch from Jamendo
    let tracks = await fetchJamendoTracks(pl.tags);

    // If few results, try boost tags
    if (tracks.length < 8) {
      for (const boost of pl.boost) {
        const more = await fetchJamendoTracks(boost, 10);
        tracks = [...tracks, ...more];
        if (tracks.length >= 12) break;
      }
    }

    // Deduplicate by ID
    const seen = new Set<string>();
    tracks = tracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    }).slice(0, 15);

    console.log(`  Found ${tracks.length} tracks from Jamendo`);

    // Create artists and tracks in DB
    const trackIds: string[] = [];

    for (const jt of tracks) {
      // Find or create artist
      let artist = await prisma.artist.findFirst({ where: { name: jt.artist_name, platform: "jamendo" } });
      if (!artist) {
        artist = await prisma.artist.create({
          data: {
            name: jt.artist_name,
            aka: jt.artist_name,
            chartedWeeks: "",
            platform: "jamendo",
            externalId: jt.artist_id,
          },
        });
      }

      // Check if track already exists
      let track = await prisma.track.findFirst({
        where: { title: jt.name, artistId: artist.id, platform: "jamendo" },
      });

      if (!track) {
        const genre = jt.musicinfo?.tags?.genres?.[0] || pl.tags.split("+")[0] || "World";
        track = await prisma.track.create({
          data: {
            title: jt.name,
            artistId: artist.id,
            genres: genre.charAt(0).toUpperCase() + genre.slice(1),
            moods: pl.mood,
            visibility: "PUBLIC",
            platform: "jamendo",
            externalId: jt.id,
            artworkUrl: jt.image || null,
            streamUrl: jt.audio,
            durationSec: jt.duration,
          },
        });

        // Add stream events
        const streams = Math.floor(Math.random() * 30) + 5;
        await prisma.streamEvent.createMany({
          data: Array.from({ length: streams }, () => ({ trackId: track!.id, eventType: "complete" })),
        });

        totalTracks++;
        console.log(`  + ${jt.name} by ${jt.artist_name} (${jt.duration}s)`);
      } else {
        // Update stream URL if missing
        if (!track.streamUrl && jt.audio) {
          await prisma.track.update({ where: { id: track.id }, data: { streamUrl: jt.audio, artworkUrl: jt.image } });
        }
      }

      trackIds.push(track.id);
    }

    // Create editorial playlist
    const existingPl = await prisma.userPlaylist.findFirst({
      where: { title: pl.title, userId: editorialUser.id },
    });

    if (!existingPl && trackIds.length > 0) {
      const playlist = await prisma.userPlaylist.create({
        data: {
          userId: editorialUser.id,
          title: pl.title,
          description: pl.description,
          isPublic: true,
        },
      });

      // Add tracks to playlist
      for (let i = 0; i < trackIds.length; i++) {
        const track = await prisma.track.findUnique({ where: { id: trackIds[i] }, include: { artist: true } });
        if (track) {
          await prisma.userPlaylistTrack.create({
            data: {
              playlistId: playlist.id,
              orderIndex: i,
              trackId: track.id,
              title: track.title,
              artist: track.artist.name,
              artworkUrl: track.artworkUrl,
            },
          });
        }
      }

      console.log(`  Created playlist: ${pl.title} (${trackIds.length} tracks)`);
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Seeded ${totalTracks} new tracks with full-length audio`);
  console.log(`Created ${PLAYLISTS.length} editorial playlists`);
  console.log(`\nTotals:`);
  console.log(`  Artists: ${await prisma.artist.count()}`);
  console.log(`  Tracks: ${await prisma.track.count()}`);
  console.log(`  Playlists: ${await prisma.userPlaylist.count()}`);
  console.log(`  Streams: ${await prisma.streamEvent.count()}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
