import { NextResponse } from "next/server";
import { subscribe } from "lib/live";
import { prisma } from "lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sse = searchParams.get("sse");

  if (sse === "1") {
    const { id, add, remove } = subscribe("feed");
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // @ts-ignore – write helper
    const res = {
      write: (msg: string) => writer.write(new TextEncoder().encode(msg)),
    };
    add(res);
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    };
    const initial = await latestFeed();
    res.write(`data: ${JSON.stringify({ type: "init", items: initial })}\n\n`);

    const response = new Response(stream.readable, { headers });
    // Cleanup
    // @ts-ignore
    response.socket?.on("close", () => remove());
    return response;
  }

  return NextResponse.json({ items: await latestFeed() });
}

async function latestFeed(limit = 20) {
  // Compose a simple union feed from likes, new playlists, and activities
  const likes = await prisma.trackLike.findMany({
    take: limit, orderBy: { createdAt: "desc" },
    include: { user: true }
  });
  const playlists = await prisma.userPlaylist.findMany({
    take: limit, orderBy: { createdAt: "desc" },
    include: { user: true }
  });
  const activities = await prisma.activity.findMany({
    take: limit, orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  const l = likes.map(l => ({ t:"like", at:l.createdAt, user:l.user.name ?? "User", target:"a track", icon:"💜" }));
  const p = playlists.map(p => ({ t:"playlist", at:p.createdAt, user:p.user.name ?? "User", target:p.title, icon:"🎵" }));
  const a = activities.map(a => ({ t:"activity", at:a.createdAt, user:a.user.name ?? "User", target:a.type, icon:"🎯" }));

  return [...l, ...p, ...a].sort((a,b)=>+new Date(b.at)-+new Date(a.at)).slice(0, limit);
}
