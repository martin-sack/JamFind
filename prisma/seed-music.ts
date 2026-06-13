import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const MUSIC = [
  { artist: "Burna Boy", country: "NG", genre: "Afrobeats", tracks: ["Last Last", "City Boys", "Anybody"] },
  { artist: "Rema", country: "NG", genre: "Afrobeats", tracks: ["Calm Down", "Dumebi"] },
  { artist: "Wizkid", country: "NG", genre: "Afropop", tracks: ["Essence", "Joro", "Come Closer"] },
  { artist: "Tyla", country: "ZA", genre: "Amapiano", tracks: ["Water", "Truth or Dare"] },
  { artist: "Asake", country: "NG", genre: "Amapiano", tracks: ["Lonely at the Top", "Bandana", "Joha"] },
  { artist: "Ayra Starr", country: "NG", genre: "Afropop", tracks: ["Rush", "Sability", "Bloody Samaritan"] },
  { artist: "King Promise", country: "GH", genre: "Highlife", tracks: ["Terminator", "Slow Down"] },
  { artist: "Sarkodie", country: "GH", genre: "Hip-Hop", tracks: ["Adonai", "Non Living Thing"] },
  { artist: "Sauti Sol", country: "KE", genre: "Bongo Flava", tracks: ["Suzanna", "Short N Sweet"] },
  { artist: "Diamond Platnumz", country: "TZ", genre: "Bongo Flava", tracks: ["Jeje", "Waah"] },
  { artist: "Victony", country: "NG", genre: "Amapiano", tracks: ["Soweto", "Kolomental"] },
  { artist: "Fireboy DML", country: "NG", genre: "Afropop", tracks: ["Peru", "Playboy", "Bandana"] },
  { artist: "CKay", country: "NG", genre: "Afrobeats", tracks: ["Love Nwantiti", "Felony"] },
  { artist: "Master KG", country: "ZA", genre: "Amapiano", tracks: ["Jerusalema", "Waya Waya"] },
  { artist: "Davido", country: "NG", genre: "Afrobeats", tracks: ["Fall", "Unavailable", "IF"] },
  { artist: "Omah Lay", country: "NG", genre: "Afropop", tracks: ["Understand", "Godly"] },
  { artist: "Shatta Wale", country: "GH", genre: "Dancehall", tracks: ["On God", "Kakai"] },
  { artist: "Tiwa Savage", country: "NG", genre: "Afropop", tracks: ["Somebody Son", "Koroba"] },
  { artist: "Stonebwoy", country: "GH", genre: "Dancehall", tracks: ["Activate", "Putuu"] },
  { artist: "Black Sherif", country: "GH", genre: "Hip-Hop", tracks: ["Kwaku the Traveller", "Second Sermon"] },
];

async function main() {
  console.log("Seeding African music catalog...\n");
  let count = 0;

  for (const entry of MUSIC) {
    let artist = await prisma.artist.findFirst({ where: { name: entry.artist } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: { name: entry.artist, aka: entry.artist, country: entry.country, chartedWeeks: "", platform: "jamfind" },
      });
      console.log("  Artist: " + entry.artist);
    }

    for (const title of entry.tracks) {
      const exists = await prisma.track.findFirst({ where: { title, artistId: artist.id } });
      if (exists) continue;

      const track = await prisma.track.create({
        data: {
          title,
          artistId: artist.id,
          genres: entry.genre,
          moods: ["Energetic", "Chill", "Party", "Romantic", "Uplifting"][Math.floor(Math.random() * 5)],
          country: entry.country,
          visibility: "PUBLIC",
          platform: "jamfind",
        },
      });

      // Generate stream events (5-50 per track)
      const streams = Math.floor(Math.random() * 45) + 5;
      await prisma.streamEvent.createMany({
        data: Array.from({ length: streams }, () => ({ trackId: track.id, eventType: "complete" })),
      });

      // Random likes from existing users
      const users = await prisma.user.findMany({ take: 5 });
      const likeCount = Math.floor(Math.random() * users.length) + 1;
      for (let i = 0; i < likeCount; i++) {
        await prisma.trackLike.create({ data: { userId: users[i].id, trackId: track.id } }).catch(() => {});
      }

      count++;
      console.log("  + " + title + " by " + entry.artist + " (" + streams + " streams, " + likeCount + " likes)");
    }
  }

  console.log("\nSeeded " + count + " tracks");
  console.log("Artists: " + await prisma.artist.count());
  console.log("Tracks: " + await prisma.track.count());
  console.log("Streams: " + await prisma.streamEvent.count());
  console.log("Likes: " + await prisma.trackLike.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
