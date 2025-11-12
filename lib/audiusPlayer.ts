// Improved Audius streaming with retry logic and proper CORS handling

async function getAudiusStreamUrl(trackId: string): Promise<string> {
  const r = await fetch(`/api/play/audius?trackId=${encodeURIComponent(trackId)}`, { 
    cache: "no-store" 
  });
  
  if (!r.ok) throw new Error("Audius stream API failed");
  
  const { streaming_url } = await r.json();
  if (!streaming_url) throw new Error("No streaming_url from Audius");
  
  // Add app_name (recommended by Audius)
  const withApp = streaming_url + (streaming_url.includes("?") ? "&" : "?") + "app_name=JamFind";
  return withApp;
}

export async function playAudius(trackId: string, audio?: HTMLAudioElement): Promise<HTMLAudioElement> {
  const a = audio ?? new Audio();
  
  // **Set crossOrigin before src** - this is crucial for CORS
  a.crossOrigin = "anonymous";
  a.preload = "none";

  const tryPlay = async () => {
    const url = await getAudiusStreamUrl(trackId);
    a.src = url;
    // Force the browser to re-evaluate the new src
    a.load();
    await a.play();
  };

  try {
    await tryPlay();
    return a;
  } catch (e) {
    console.warn("First Audius play attempt failed, retrying with fresh URL:", e);
    // One automatic retry with a fresh URL (redirects can expire quickly)
    try {
      await tryPlay();
      return a;
    } catch (e2) {
      console.error("Audius play failed after retry:", e2);
      throw e2;
    }
  }
}

// Enhanced version that handles loading states
export async function playAudiusWithStates(
  trackId: string, 
  audio?: HTMLAudioElement,
  onLoading?: (loading: boolean) => void,
  onError?: (error: string) => void
): Promise<HTMLAudioElement> {
  onLoading?.(true);
  
  try {
    const result = await playAudius(trackId, audio);
    onLoading?.(false);
    return result;
  } catch (error) {
    onLoading?.(false);
    const errorMessage = error instanceof Error ? error.message : "Playback failed";
    onError?.(errorMessage);
    throw error;
  }
}