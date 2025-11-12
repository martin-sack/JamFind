import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Make a few demo users if missing
  const emails = ["amee@demo.dev","kwesi@demo.dev","lola@demo.dev","nana@demo.dev"];
  for (const e of emails) {
    await prisma.user.upsert({
      where: { email: e },
      update: {},
      create: { email: e, name: e.split("@")[0], points: 500 },
    });
  }

  // Give them public playlists
  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  for (const u of users) {
    await prisma.userPlaylist.upsert({
      where: { id: `${u.id}_p1` },
      update: {},
      create: { id: `${u.id}_p1`, userId: u.id, title: "Vibes Pack", isPublic: true },
    }).catch(()=>{});
  }
  console.log("Seeded suggestion demo users.");
}

main().finally(()=>prisma.$disconnect());
