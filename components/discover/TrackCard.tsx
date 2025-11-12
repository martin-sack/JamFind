"use client";
import Image from "next/image";
import { usePlayer } from "components/player/usePlayer";

export default function TrackCard({ i, list }: { i: number; list: any[] }) {
  const item = list[i];
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-all group">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
        {item.artworkUrl ? (
          <Image 
            src={item.artworkUrl} 
            alt={item.title} 
            fill 
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-white/10" />
        )}
      </div>
      
      <div className="text-sm font-medium truncate text-white">{item.title}</div>
      <div className="text-xs text-white/60 truncate">{item.artistName}</div>
      
      <div className="mt-3">
        <button
          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white
                     hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
          onClick={() => {
            const q = list.map(t => ({
              id: t.id, 
              title: t.title, 
              artist: t.artistName,
              streamHref: t.streamHref, 
              artworkUrl: t.artworkUrl
            }));
            // start queue at this item
            usePlayer.getState().setQueue(q, i);
          }}
        >
          ▶ Play
        </button>
      </div>
    </div>
  );
}
