import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Ensure base demo users exist
  const emails = [
    "user1@test.com",       // you (seeded)
    "tester@jamfind.dev",   // admin (seeded)
    "mee@demo.dev",
    "kwesi@demo.dev",
    "lola@demo.dev",
    "nana@demo.dev",
  ];

  // Upsert users with simple names & starter xp
  for (const e of emails) {
    await prisma.user.upsert({
      where: { email: e },
      update: {},
      create: { email: e, name: e.split("@")[0], xp: 500 },
    });
  }

  const me = await prisma.user.findUnique({ where: { email: "user1@test.com" } });
  const others = await prisma.user.findMany({ where: { email: { in: emails.filter(e => e !== "user1@test.com") } } });

  // Follow 2-3 people for demo
  for (let i = 0; i < Math.min(3, others.length); i++) {
    const u = others[i];
    await prisma.userFollow.upsert({
      where: { followerId_followeeId: { followerId: me!.id, followeeId: u.id } },
      update: {},
      create: { followerId: me!.id, followeeId: u.id },
    });
  }

  // Create public playlists for each
  for (const u of [me!, ...others]) {
    for (const idx of [1, 2]) {
      await prisma.userPlaylist.upsert({
        where: { id: `${u.id}_demo_${idx}` },
        update: { updatedAt: new Date(Date.now() - Math.random() * 1000 * 3600 * 48) },
        create: {
          id: `${u.id}_demo_${idx}`,
          userId: u.id,
          title: idx === 1 ? "Vibes Pack" : "Night Drive",
          isPublic: true,
        },
      });

      // Add 4 fake items (fallback metadata)
      for (let k = 0; k < 4; k++) {
        await prisma.userPlaylistTrack.create({
          data: {
            playlistId: `${u.id}_demo_${idx}`,
            orderIndex: k,
            title: `Demo Track ${k + 1}`,
            artist: idx === 1 ? "Demo Artist" : "Night Runner",
            artworkUrl: null,
          },
        });
      }
    }
  }

  // Likes for me on random tracks (use actual Track ids if exist; else mock some)
  // If you have Track table filled, map a few ids here
  // Otherwise create a small fake Track set to like (optional)
  // Example: like 3 mock entries if Track exists
  const somePlaylists = await prisma.userPlaylist.findMany({ take: 5, include: { tracks: true } });
  const flat = somePlaylists.flatMap(p => p.tracks).slice(0, 6);
  for (const t of flat) {
    await prisma.trackLike.upsert({
      where: { userId_trackId: { userId: me!.id, trackId: t.trackId ?? t.id } }, // if trackId is null, fallback on PT id
      update: {},
      create: { userId: me!.id, trackId: t.trackId ?? t.id },
    });
  }

  // Weekly submissions for me
  const now = new Date();
  const weeks = [0, 7, 14].map(d => new Date(now.getFullYear(), now.getMonth(), now.getDate() - d)); // 0, 1w, 2w
  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i];
    await prisma.weeklySubmission.upsert({
      where: { id: `${me!.id}_w_${i}` },
      update: {},
      create: {
        id: `${me!.id}_w_${i}`,
        userId: me!.id,
        weekStart: new Date(w.getFullYear(), w.getMonth(), w.getDate() - (w.getDay() || 7) + 1), // Monday-ish
        category: ["Love", "Hip-Hop", "Late Night Vibes"][i % 3],
        status: "submitted",
      },
    });
  }

  // Activity feed entries
  const types = ["playlist_created", "liked_track", "submitted_playlist", "followed_user"];
  for (const u of [me!, ...others]) {
    for (let i = 0; i < 3; i++) {
      await prisma.activity.create({
        data: {
          userId: u.id,
          type: types[i % types.length],
          metadata: JSON.stringify({
            text: i === 0 ? "created a new playlist 'Vibes Pack'" :
                  i === 1 ? "liked 'Demo Track 1' by Demo Artist" :
                  i === 2 ? "submitted a weekly playlist" : "followed someone",
          }),
          createdAt: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 5),
        },
      });
    }
  }

  console.log("Seeded home demo data.");
}

main().finally(() => prisma.$disconnect());
