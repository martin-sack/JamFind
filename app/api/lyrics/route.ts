import { NextResponse } from "next/server";

async function fromGenius(q: string) {
  const token = process.env.GENIUS_ACCESS_TOKEN;
  if (!token) return null;
  
  const r = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` }, 
    cache: "no-store"
  });
  
  if (!r.ok) return null;
  const j = await r.json();
  const hit = j?.response?.hits?.[0]?.result;
  return hit ? { provider: "genius", url: hit.url, title: hit.full_title } : null;
}

async function fromLyricsOvh(artist: string, title: string) {
  const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { 
    cache: "no-store" 
  });
  
  if (!r.ok) return null;
  const j = await r.json();
  return j?.lyrics ? { provider: "lyrics.ovh", lyrics: j.lyrics } : null;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const artist = u.searchParams.get("artist") || "";
  const title = u.searchParams.get("title") || "";
  const q = `${artist} ${title}`.trim();

  const ovh = artist && title ? await fromLyricsOvh(artist, title) : null;
  if (ovh) return NextResponse.json(ovh);

  const gen = q ? await fromGenius(q) : null;
  if (gen) return NextResponse.json(gen);

  return NextResponse.json({ error: "No lyrics found" }, { status: 404 });
}