import type { Source } from "lib/types";

// Platforms that support direct HTML5 audio streaming
export const DIRECT_STREAM_SOURCES = new Set<Source>([
  "audiomack",
  "audius",
  "jamendo",
]);

// Platforms that require embed players
export const EMBED_SOURCES = new Set<Source>([
  "soundcloud",
  // "youtube", "boomplay" (when you add)
]);

// Check if a source supports direct streaming
export function supportsDirectStream(source: Source): boolean {
  return DIRECT_STREAM_SOURCES.has(source);
}

// Check if a source requires embed player
export function requiresEmbed(source: Source): boolean {
  return EMBED_SOURCES.has(source);
}

// Get the appropriate playback method for a source
export function getPlaybackMethod(source: Source): 'direct' | 'embed' | 'external' {
  if (DIRECT_STREAM_SOURCES.has(source)) {
    return 'direct';
  }
  if (EMBED_SOURCES.has(source)) {
    return 'embed';
  }
  return 'external';
}