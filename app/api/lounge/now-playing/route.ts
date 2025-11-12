import { NextResponse } from "next/server";
import { prisma } from "lib/db";
import { subscribe } from "lib/live";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sse = searchParams.get("sse");

  async function now() {
    // For now, return a mock battle since we don't have team battles in schema
    return { 
      id: "mock-battle-1", 
      title: "Now Playing: Afro Soul Nights vs Midnight Drive", 
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    };
  }

  if (sse === "1") {
    const { id, add, remove } = subscribe("now");
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const res = { write: (msg: string) => writer.write(new TextEncoder().encode(msg)) };
    add(res as any);
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    };
    res.write(`data: ${JSON.stringify({ type:"init", now: await now() })}\n\n`);
    const response = new Response(stream.readable, { headers });
    // @ts-ignore
    response.socket?.on("close", () => remove());
    return response;
  }

  return NextResponse.json({ now: await now() });
}
