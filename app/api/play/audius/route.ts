import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

async function resolveHost() {
  try {
    const r = await fetch("https://api.audius.co", { cache: "no-store" });
    const j = await r.json();
    return j?.data?.[0] || "https://api.audius.co";
  } catch { 
    return "https://api.audius.co"; 
  }
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("trackId");
  if (!id) return NextResponse.json({ error: "trackId required" }, { status: 400 });
  
  try {
    const host = await resolveHost();
    const r = await fetch(`${host}/v1/tracks/${id}/stream`, { 
      redirect: "manual",
      cache: "no-store"
    });
    
    const location = r.headers.get("location");
    if (!location) {
      console.error(`No location header for Audius track ${id}, status: ${r.status}`);
      return NextResponse.json({ error: "No stream url" }, { status: 502 });
    }
    
    // Return with no-cache headers since URLs expire quickly
    const response = NextResponse.json({ streaming_url: location });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error(`Error fetching Audius stream for track ${id}:`, error);
    return NextResponse.json({ error: "Failed to fetch stream URL" }, { status: 500 });
  }
}