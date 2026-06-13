import { NextResponse } from "next/server";
import { subscribe } from "lib/live";
import { prisma } from "lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sse = searchParams.get("sse");
  
  async function top() {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { xp: "desc" },
      select: { id:true, name:true, xp:true }
    });
    return users.map(u => ({ id:u.id, name:u.name ?? "User", energy:u.xp }));
  }

  if (sse === "1") {
    const { id, add, remove } = subscribe("ticker");
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const res = { write: (msg: string) => writer.write(new TextEncoder().encode(msg)) };
    add(res as any);
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    };
    res.write(`data: ${JSON.stringify({ type:"init", leaders: await top() })}\n\n`);
    const response = new Response(stream.readable, { headers });
    // @ts-ignore
    response.socket?.on("close", () => remove());
    return response;
  }

  return NextResponse.json({ leaders: await top() });
}
