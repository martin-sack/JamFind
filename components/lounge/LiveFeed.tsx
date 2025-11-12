"use client";
import { useEffect, useState } from "react";

type Item = { id:string; time:string; user:string; action:string; target?:string; icon?:string };

export default function LiveFeed() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    async function fetchFeed() {
      // TODO: replace with /api/lounge/feed
      setItems([
        { id:"1", time:"now", user:"Tester", action:"voted for", target:"DJ Kuda", icon:"🎧" },
        { id:"2", time:"1m", user:"SnowQueen", action:"liked", target:"Vibe Nation", icon:"💜" },
      ]);
    }
    fetchFeed();
    const t = setInterval(fetchFeed, 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-3">
      {items.map(i => (
        <div key={i.id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{i.icon ?? "🎵"}</div>
          <div className="rounded-2xl px-4 py-2 bg-white/8 border border-white/10">
            <div className="text-sm">
              <span className="font-semibold">{i.user}</span> {i.action} <span className="text-fuchsia-300">{i.target}</span>
            </div>
            <div className="text-[11px] text-white/50">{i.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
