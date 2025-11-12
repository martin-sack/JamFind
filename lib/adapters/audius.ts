import type { Track } from "lib/types";
import { makeId } from "./normalize";

export function mapAudiusItem(item: any): Track | null {
  const source: "audius" = "audius";
  const source_id = String(item?.id ?? item?.track_id ?? "");
  const title = item?.title;
  const artist = item?.user?.name || item?.user?.handle || "Unknown";
  const artwork = item?.artwork?.['150x150'] || item?.artwork?.['480x480'] || item?.cover_art;
  const duration = item?.duration ? Number(item.duration) : undefined;
  
  // Filter out obviously unplayable tracks
  if (!source_id || !title) return null;
  if (duration && duration <= 0) return null; // Skip tracks with no duration
  if (item?.is_unlisted === true) return null; // Skip unlisted tracks
  if (item?.is_streamable === false) return null; // Skip non-streamable tracks
  
  return { 
    id: makeId(source, source_id), 
    source, source_id, title, artist, artwork, duration, 
    streamable: item?.is_streamable !== false 
  };
}