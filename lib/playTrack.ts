import { usePlayer, type QueueItem } from "@/components/player/usePlayer";

export interface PlayableTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
  platform?: string;
  externalId?: string | null;
  streamUrl?: string | null;
  streamHref?: string;
}

/**
 * Resolve a streaming URL for any platform, then load into the player.
 * Returns the resolved streamHref.
 */
export async function resolveStreamUrl(track: PlayableTrack): Promise<string> {
  // Already has a direct stream URL (e.g. Jamendo audio URLs)
  if (track.streamHref) return track.streamHref;
  if (track.streamUrl && track.streamUrl.startsWith("http")) return track.streamUrl;

  const platform = track.platform || "jamfind";
  const extId = track.externalId || track.id;

  let url = "";

  switch (platform) {
    case "audius": {
      const r = await fetch(`/api/play/audius?trackId=${encodeURIComponent(extId)}`);
      const j = await r.json();
      url = j.streaming_url || "";
      break;
    }
    case "jamendo": {
      const r = await fetch(`/api/play/jamendo?trackId=${encodeURIComponent(extId)}`);
      const j = await r.json();
      url = j.streaming_url || "";
      break;
    }
    case "soundcloud": {
      // SoundCloud returns embed HTML — use direct URL if available
      const r = await fetch(`/api/play/soundcloud?trackId=${encodeURIComponent(extId)}`);
      const j = await r.json();
      url = j.streaming_url || "";
      break;
    }
    default: {
      // JamFind / S3 uploaded — use presigned HLS URL
      const r = await fetch(`/api/stream/${track.id}`);
      const j = await r.json();
      url = j.streamUrl || "";
      break;
    }
  }

  if (!url) throw new Error("Stream unavailable");
  return url;
}

/**
 * Play a single track: resolve URL, load into player, log the stream event.
 */
export async function playTrack(track: PlayableTrack): Promise<string> {
  const streamHref = await resolveStreamUrl(track);

  const item: QueueItem = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    streamHref,
    artworkUrl: track.artworkUrl,
    platform: track.platform,
  };

  usePlayer.getState().setQueue([item], 0);

  // Fire-and-forget stream logging
  fetch("/api/stream/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackId: track.id, platform: track.platform || "jamfind" }),
  }).catch(() => {});

  return streamHref;
}

/**
 * Play a track within a queue context (e.g., from a list of tracks).
 */
export async function playTrackInQueue(
  tracks: PlayableTrack[],
  startIndex: number
): Promise<void> {
  const items: QueueItem[] = await Promise.all(
    tracks.map(async (t) => {
      try {
        const streamHref = await resolveStreamUrl(t);
        return { id: t.id, title: t.title, artist: t.artist, streamHref, artworkUrl: t.artworkUrl, platform: t.platform };
      } catch {
        return { id: t.id, title: t.title, artist: t.artist, streamHref: "", artworkUrl: t.artworkUrl, platform: t.platform };
      }
    })
  );

  usePlayer.getState().setQueue(items.filter((i) => i.streamHref), startIndex);

  // Log the starting track
  const startTrack = tracks[startIndex];
  if (startTrack) {
    fetch("/api/stream/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: startTrack.id, platform: startTrack.platform || "jamfind" }),
    }).catch(() => {});
  }
}
