import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("trackId");
  if (!id) return NextResponse.json({ error: "trackId required" }, { status: 400 });
  
  const embed = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}`;
  return NextResponse.json({ 
    embed_html: `<iframe width="100%" height="166" scrolling="no" frameborder="no" src="${embed}"></iframe>` 
  });
}