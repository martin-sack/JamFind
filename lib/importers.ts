import jwt from "jsonwebtoken";

/* ---------- URL detection ---------- */
export type Provider = "spotify" | "apple" | "youtube";

export function detectProvider(url: string): Provider | null {
  if (/open\.spotify\.com\/playlist\/[A-Za-z0-9]+/i.test(url)) return "spotify";
  if (/music\.apple\.com\/.+\/playlist\/.+\/[a-z0-9]+/i.test(url)) return "apple";
  if (/youtube\.com\/playlist\?list=|youtu\.be\//i.test(url)) return "youtube";
  return null;
}

/* ---------- Normalized track shape ---------- */
export type ImportedTrack = {
  title: string;
  artist: string;
  artworkUrl?: string | null;
  source: Provider;
  sourceId: string;   // provider track id
};

/* ---------- SPOTIFY (client credentials) ---------- */
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

async function spotifyToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description || "Spotify auth failed");
  return json.access_token;
}

function parseSpotifyPlaylistId(url: string): string | null {
  const m = url.match(/playlist\/([A-Za-z0-9]+)/i);
  return m?.[1] ?? null;
}

async function importSpotify(url: string): Promise<ImportedTrack[]> {
  const playlistId = parseSpotifyPlaylistId(url);
  if (!playlistId) return [];
  const token = await spotifyToken();
  // fields trimmed for performance
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.items(track(name,artists(name),id,album(images)))`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Spotify fetch failed");
  const items = (data?.tracks?.items ?? []).filter((x:any)=>x.track);
  return items.map((it:any) => {
    const t = it.track;
    const art = t?.album?.images?.[1]?.url || t?.album?.images?.[0]?.url || null;
    const artist = (t?.artists ?? []).map((a:any)=>a.name).join(", ");
    return {
      title: t?.name ?? "Unknown",
      artist: artist || "Unknown",
      artworkUrl: art,
      source: "spotify" as const,
      sourceId: t?.id ?? "",
    };
  });
}

/* ---------- APPLE MUSIC (developer token + catalog) ---------- */
const APPLE_TEAM_ID = process.env.APPLE_MUSIC_TEAM_ID!;
const APPLE_KEY_ID  = process.env.APPLE_MUSIC_KEY_ID!;
const APPLE_PK_B64  = process.env.APPLE_MUSIC_PRIVATE_KEY_B64!;
const APPLE_STOREFRONT = process.env.APPLE_MUSIC_STOREFRONT || "us";

function appleDevToken(): string {
  const privateKey = Buffer.from(APPLE_PK_B64, "base64").toString("utf8");
  // 30 minutes exp is fine for server calls
  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    issuer: APPLE_TEAM_ID,
    expiresIn: "30m",
    header: { alg: "ES256", kid: APPLE_KEY_ID },
  });
  return token;
}

function parseApplePlaylistId(url: string): { storefront: string; id: string } | null {
  // e.g. https://music.apple.com/us/playlist/.../pl.u-xxxx
  const s = url.match(/music\.apple\.com\/([a-z]{2})\//i)?.[1] ?? APPLE_STOREFRONT;
  const id = url.match(/playlist\/.*\/([a-z0-9\.\-_]+)/i)?.[1];
  return id ? { storefront: s, id } : null;
}

async function importApple(url: string): Promise<ImportedTrack[]> {
  const ref = parseApplePlaylistId(url);
  if (!ref) return [];
  const devToken = appleDevToken();
  const res = await fetch(`https://api.music.apple.com/v1/catalog/${ref.storefront}/playlists/${ref.id}`, {
    headers: { Authorization: `Bearer ${devToken}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errors?.[0]?.detail || "Apple fetch failed");

  // Some playlists need another request to fetch tracks relationship
  const relUrl = data?.data?.[0]?.relationships?.tracks?.href;
  if (!relUrl) return [];
  const res2 = await fetch(`https://api.music.apple.com${relUrl}`, {
    headers: { Authorization: `Bearer ${devToken}` },
    cache: "no-store",
  });
  const tracks = await res2.json();
  if (!res2.ok) throw new Error(tracks?.errors?.[0]?.detail || "Apple tracks failed");

  const items = tracks?.data ?? [];
  return items.map((it:any)=>{
    const attrs = it?.attributes || {};
    return {
      title: attrs.name || "Unknown",
      artist: attrs.artistName || "Unknown",
      artworkUrl: attrs.artwork ? attrs.artwork.url?.replace("{w}x{h}", "400x400") : null,
      source: "apple" as const,
      sourceId: it?.id ?? "",
    };
  });
}

/* ---------- YOUTUBE (Data API v3) ---------- */
const YT_KEY = process.env.YOUTUBE_API_KEY!;

function parseYouTubePlaylistId(url: string): string | null {
  // supports https://www.youtube.com/playlist?list=PLxxx and youtu.be URLs with list param
  const u = new URL(url);
  const list = u.searchParams.get("list");
  return list || null;
}

async function importYouTube(url: string): Promise<ImportedTrack[]> {
  const listId = parseYouTubePlaylistId(url);
  if (!listId) return [];
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(listId)}&key=${YT_KEY}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "YouTube fetch failed");

  const items = (data?.items ?? []).filter((x:any)=>x?.snippet?.title && x?.snippet?.videoOwnerChannelTitle);
  return items.map((it:any)=>({
    title: it.snippet.title,
    artist: it.snippet.videoOwnerChannelTitle,
    artworkUrl: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url || null,
    source: "youtube" as const,
    sourceId: it.snippet.resourceId?.videoId ?? "",
  }));
}

/* ---------- Public entry ---------- */
export async function fetchPlaylistReal(url: string): Promise<{ provider: Provider | null; items: ImportedTrack[] }> {
  const p = detectProvider(url);
  if (!p) return { provider: null, items: [] };
  if (p === "spotify")  return { provider: p, items: await importSpotify(url) };
  if (p === "apple")    return { provider: p, items: await importApple(url) };
  if (p === "youtube")  return { provider: p, items: await importYouTube(url) };
  return { provider: null, items: [] };
}
