import type { Track } from "lib/types";
import { makeId } from "./normalize";

export function mapAudiomackItem(item: any): Track | null {
  const source: "audiomack" = "audiomack";
  const source_id = String(item?.id || item?.music_id || item?.slug || "");
  const title = item?.title || item?.name;
  const artist = item?.artist || item?.user?.name || item?.uploader || "Unknown";
  const artwork = item?.image || item?.artwork || item?.cover_url;
  const duration = typeof item?.duration === "number" ? item.duration : item?.duration_seconds;
  
  if (!source_id || !title) return null;
  
  return {
    id: makeId(source, source_id),
    source, source_id, title, artist, artwork, duration, streamable: true,
  };
}