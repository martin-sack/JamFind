import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";
import { publish } from "lib/live";
import { rl } from "lib/ratelimit";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { battleId, teamId, energy } = await req.json() as { battleId: string; teamId: string; energy: number };
  if (![10, 50, 100].includes(energy)) {
    return NextResponse.json({ error: "Invalid energy stake" }, { status: 400 });
  }

  // Rate limit
  const headers = rl.checkNext(req, 10);
  if (headers.get("X-RateLimit-Remaining") === "0") {
    return NextResponse.json({ error: "Rate limit" }, { status: 429, headers });
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, xp: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.xp < energy) {
    return NextResponse.json({ error: "Not enough Energy" }, { status: 400 });
  }

  // Mock battle check - in real implementation, check if battle exists and is live
  if (battleId !== "mock-battle-1") {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  // Transaction: deduct energy (xp)
  const result = await prisma.$transaction(async (tx) => {
    // Deduct energy
    await tx.user.update({
      where: { id: user.id },
      data: { xp: { decrement: energy } }
    });

    // Create activity record
    await tx.activity.create({
      data: {
        userId: user.id,
        type: "voted_in_battle",
        refId: battleId,
        metadata: JSON.stringify({ teamId, energy, battleId })
      }
    });

    return { remaining: user.xp - energy };
  });

  // Broadcast updates
  publish("feed", { 
    t: "vote", 
    user: user.name ?? "User", 
    target: teamId, 
    energy, 
    at: Date.now(),
    icon: "⚡"
  });
  publish("ticker", { t: "bump" }); // force refresh

  return NextResponse.json({ 
    ok: true, 
    remainingEnergy: result.remaining,
    message: `+${energy} Energy used — vote cast!`
  });
}
