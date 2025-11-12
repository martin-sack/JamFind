import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BASE = "https://api.jamendo.com/v3.0/tracks";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("trackId");
  if (!id) return NextResponse.json({ error: "trackId required" }, { status: 400 });
  
  const client_id = process.env.JAMENDO_CLIENT_ID;
  if (!client_id) {
    return NextResponse.json({ error: "Jamendo client ID not configured" }, { status: 500 });
  }
  
  const r = await fetch(`${BASE}/file?client_id=${client_id}&id=${id}`, { cache: "no-store" });
  const j = await r.json();
  const url = j?.results?.[0]?.audio || j?.results?.[0]?.audiodownload;
  if (!url) return NextResponse.json({ error: "No stream url" }, { status: 502 });
  
  return NextResponse.json({ streaming_url: url });
}