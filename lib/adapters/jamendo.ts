import type { Track } from "lib/types";
import { makeId } from "./normalize";

export function mapJamendoItem(item: any): Track | null {
  const source: "jamendo" = "jamendo";
  const source_id = String(item?.id ?? "");
  const title = item?.name || item?.title;
  const artist = item?.artist_name || item?.artist;
  const artwork = item?.image || item?.album_image || item?.album_image_large;
  const duration = item?.duration ? Number(item.duration) : undefined;
  
  if (!source_id || !title) return null;
  
  return { 
    id: makeId(source, source_id), 
    source, source_id, title, artist, artwork, duration, streamable: true 
  };
}