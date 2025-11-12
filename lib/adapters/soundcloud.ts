import type { Track } from "lib/types";
import { makeId } from "./normalize";

export function mapSoundCloudItem(item: any): Track | null {
  const source: "soundcloud" = "soundcloud";
  const source_id = String(item?.id ?? "");
  const title = item?.title;
  const artist = item?.user?.username || "Unknown";
  const artwork = item?.artwork_url || item?.user?.avatar_url || undefined;
  const duration = item?.duration ? Math.round(item.duration / 1000) : undefined;
  
  if (!source_id || !title) return null;
  
  return {
    id: makeId(source, source_id),
    source, source_id, title, artist, artwork, duration,
    streamable: item?.streamable ?? true,
  };
}