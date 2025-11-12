export type Source = "audiomack" | "soundcloud" | "jamendo" | "audius";

export type Track = {
  id: string;          // global id e.g. `${source}:${source_id}`
  source: Source;
  source_id: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;   // seconds
};