"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePlayer } from "./usePlayer";

export default function AudioBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { queue, index, playing, next, play, pause } = usePlayer();
  const current = index >= 0 ? queue[index] : null;

  useEffect(() => {
    if (!audioRef.current || !current) return;
    audioRef.current.src = current.streamHref;
    if (playing) audioRef.current.play().catch(() => {});
  }, [current?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  if (!current) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-3 flex items-center gap-3">
      {current.artworkUrl ? (
        <Image 
          src={current.artworkUrl} 
          alt="" 
          width={40} 
          height={40} 
          className="rounded-lg" 
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-white/10" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-white">{current.title}</div>
        <div className="truncate text-xs text-white/60">{current.artist}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="px-2 py-1 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-all"
          onClick={() => usePlayer.getState().prev()}
        >
          ⏮
        </button>
        
        <button 
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
          onClick={() => (playing ? pause() : play())}
        >
          {playing ? "Pause" : "Play"}
        </button>
        
        <button 
          className="px-2 py-1 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-all"
          onClick={next}
        >
          ⏭
        </button>
      </div>
      
      <audio ref={audioRef} onEnded={next} />
    </div>
  );
}
