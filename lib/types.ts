export type Source = "audiomack" | "soundcloud" | "jamendo" | "audius";

export type Track = {
  id: string;             // global id, e.g., `${source}:${source_id}`
  source: Source;
  source_id: string;      // provider original id
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;      // seconds
  streamable?: boolean;
  previewUrl?: string;
};

export type SearchResponse = {
  items: Track[];
  nextPageToken?: string | null;
};