import { playAudius } from "lib/audiusPlayer";

export async function playFromProvider(source: string, source_id: string) {
  if (source === "audiomack") {
    const r = await fetch("/api/audiomack/play", { 
      method: "POST", 
      headers: {"Content-Type": "application/json"}, 
      body: JSON.stringify({ trackId: source_id }) 
    });
    const j = await r.json();
    if (j.streaming_url) { 
      const a = new Audio();
      a.crossOrigin = "anonymous";
      a.src = j.streaming_url;
      await a.play(); 
      return; 
    }
  }
  
  if (source === "audius") {
    // Use global audio instance for better UX
    const audio = (window as any).__jamfindAudio ?? new Audio();
    (window as any).__jamfindAudio = audio;
    await playAudius(source_id, audio);
    return;
  }
  
  if (source === "jamendo") {
    const r = await fetch(`/api/play/jamendo?trackId=${encodeURIComponent(source_id)}`);
    const j = await r.json();
    if (j.streaming_url) { 
      const a = new Audio(j.streaming_url); 
      await a.play(); 
      return; 
    }
  }
  
  if (source === "soundcloud") {
    const r = await fetch(`/api/play/soundcloud?trackId=${encodeURIComponent(source_id)}`);
    return await r.json(); // { embed_html }
  }
  
  throw new Error("Unsupported source");
}