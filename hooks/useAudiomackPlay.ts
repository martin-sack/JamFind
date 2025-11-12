import { useRef, useState, useCallback } from "react";

type PlayState = "idle" | "loading" | "playing" | "paused" | "error";

export function useAudiomackPlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;
      
      // Add event listeners
      audio.addEventListener('ended', () => setState('idle'));
      audio.addEventListener('pause', () => setState('paused'));
      audio.addEventListener('play', () => setState('playing'));
    }
    return audioRef.current!;
  };

  const playTrack = useCallback(async (trackId: string) => {
    setState("loading");
    setError(null);
    setCurrentTrackId(trackId);
    
    try {
      const r = await fetch("/api/audiomack/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });
      
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Failed to fetch play URL");

      const audio = ensureAudio();
      audio.src = data.streaming_url;
      
      // Attempt immediate playback (URL expires quickly)
      await audio.play();
      setState("playing");

      // If the URL dies mid-play, try once more:
      const onError = async () => {
        audio.removeEventListener("error", onError);
        console.log("Audio error, attempting retry...");
        
        try {
          const r2 = await fetch("/api/audiomack/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId }),
          });
          
          const d2 = await r2.json();
          if (!r2.ok) throw new Error(d2?.error || "Retry failed");
          
          audio.src = d2.streaming_url;
          await audio.play();
          setState("playing");
        } catch (e: any) {
          setState("error");
          setError(e.message || "Playback failed");
        }
      };

      audio.addEventListener("error", onError, { once: true });
    } catch (e: any) {
      setState("error");
      setError(e.message || "Playback failed");
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      setState("playing");
    }).catch((e) => {
      setState("error");
      setError(e.message || "Resume failed");
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState("idle");
    setCurrentTrackId(null);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const getCurrentTime = useCallback(() => {
    const audio = audioRef.current;
    return audio ? audio.currentTime : 0;
  }, []);

  const getDuration = useCallback(() => {
    const audio = audioRef.current;
    return audio ? audio.duration : 0;
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  return { 
    state, 
    error, 
    currentTrackId,
    playTrack, 
    pause, 
    resume,
    stop,
    setVolume,
    getCurrentTime,
    getDuration,
    seek,
    audioElement: audioRef.current
  };
}