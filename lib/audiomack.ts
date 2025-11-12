export type NormalizedTrack = {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number; // seconds
  source: "audiomack";
  source_id: string;
};

function mapOne(item: any): NormalizedTrack | null {
  // Adjust keys to match the JSON in your PDF (log a sample to verify)
  const id = String(item?.id || item?.music_id || item?.slug || "");
  const title = item?.title || item?.name;
  const artist =
    item?.artist || item?.uploader || item?.user?.name || item?.author || "Unknown";
  const artwork =
    item?.image || item?.artwork || item?.cover_url || item?.thumbnail || undefined;
  const duration =
    typeof item?.duration === "number"
      ? item.duration
      : item?.duration_seconds ?? item?.length ?? undefined;

  if (!id || !title) return null;

  return {
    id: `audiomack:${id}`,
    title,
    artist,
    artwork,
    duration,
    source: "audiomack",
    source_id: id,
  };
}

export async function searchAudiomack(q: string, limit = 20) {
  const url = `/api/audiomack/search?` + new URLSearchParams({ q, limit: String(limit) });
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();

  if (!r.ok) throw new Error(data?.error || "Audiomack search failed");

  const rawList =
    Array.isArray(data?.raw?.results) ? data.raw.results :
    Array.isArray(data?.raw?.data) ? data.raw.data :
    Array.isArray(data?.raw?.items) ? data.raw.items :
    Array.isArray(data?.raw) ? data.raw :
    [];

  const tracks = rawList
    .map(mapOne)
    .filter(Boolean) as NormalizedTrack[];

  return tracks;
}

// Integration with existing unified music system
export function normalizedTrackToUnified(track: NormalizedTrack) {
  return {
    id: track.id,
    title: track.title,
    artist: {
      id: `audiomack_artist_${track.source_id}`,
      name: track.artist
    },
    album: null,
    duration: track.duration ? track.duration * 1000 : 180000, // Convert to milliseconds, default 3 minutes
    artworkUrl: track.artwork,
    streamUrl: undefined, // Will be fetched via play API
    externalUrl: `https://audiomack.com/song/${track.source_id}`,
    platform: 'audiomack' as const,
    createdAt: new Date().toISOString()
  };
}