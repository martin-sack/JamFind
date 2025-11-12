import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const mk = async (email: string, name: string, pass: string) => {
    const passwordHash = await bcrypt.hash(pass, 10);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash },
    });
  };
  await mk("tester@jamfind.dev", "Tester", "jamfind123");
  await mk("guest@jamfind.dev", "Guest", "guest123");
  console.log("Seeded: tester@jamfind.dev / jamfind123, guest@jamfind.dev / guest123");
}

main().finally(()=>prisma.$disconnect());
