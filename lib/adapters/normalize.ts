import type { Track, Source } from "lib/types";

export function makeId(source: Source, source_id: string) {
  return `${source}:${source_id}`;
}