import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create mock users
  const user1 = await prisma.user.upsert({
    where: { email: "user1@test.com" },
    update: {},
    create: { email: "user1@test.com", name: "User One" }
  });

  // Create a mock artist
  const artist = await prisma.artist.create({
    data: { name: "Demo Artist", aka: "JamDemo", country: "GH", chartedWeeks: "" }
  });

  // Create tracks
  const track1 = await prisma.track.create({
    data: {
      title: "Vibe Nation",
      artistId: artist.id,
      genres: "Afrobeat",
      moods: "Energetic",
      country: "GH",
      visibility: "PUBLIC"
    }
  });
  const track2 = await prisma.track.create({
    data: {
      title: "Sunset Groove",
      artistId: artist.id,
      genres: "Amapiano",
      moods: "Chill",
      country: "NG",
      visibility: "PUBLIC"
    }
  });

  // Add mock StreamEvents
  await prisma.streamEvent.createMany({
    data: [
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" }
    ]
  });

  // Add more stream events for realistic charts
  await prisma.streamEvent.createMany({
    data: [
      // track1 spikes (popular track)
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      { trackId: track1.id, eventType: "complete" },
      // track2 steady (moderately popular)
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
      { trackId: track2.id, eventType: "complete" },
    ]
  });

  console.log("✅ Seeded mock tracks & stream events");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
