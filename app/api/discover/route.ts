import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const artist = u.searchParams.get("artist") || "";
  const lastKey = process.env.LASTFM_API_KEY;
  const tdKey = process.env.TASTEDIVE_API_KEY;
  const results: any = {};

  if (artist && lastKey) {
    try {
      const r = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${lastKey}&format=json`, { 
        cache: "no-store" 
      });
      if (r.ok) {
        results.lastfm = await r.json();
      }
    } catch (error) {
      console.error("Last.fm API error:", error);
    }
  }
  
  if (artist && tdKey) {
    try {
      const r2 = await fetch(`https://tastedive.com/api/similar?q=${encodeURIComponent(artist)}&type=music&k=${tdKey}`, { 
        cache: "no-store" 
      });
      if (r2.ok) {
        results.tastedive = await r2.json();
      }
    } catch (error) {
      console.error("TasteDive API error:", error);
    }
  }
  
  return NextResponse.json(results);
}