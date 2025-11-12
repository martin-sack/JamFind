"use client";
import { useEffect, useState } from "react";
import { TOKENS } from "lib/labels";

export default function RightTicker() {
  const [leaders, setLeaders] = useState<{name:string; energy:number}[]>([]);
  useEffect(() => {
    let closed = false;
    try {
      const es = new EventSource("/api/lounge/ticker?sse=1");
      es.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.leaders) setLeaders(d.leaders);
      };
      es.onerror = () => es.close();
      return () => { closed = true; es.close(); };
    } catch {
      const t = setInterval(async () => {
        const r = await fetch("/api/lounge/ticker").then(r=>r.json());
        if (!closed) setLeaders(r.leaders);
      }, 5000);
      return () => clearInterval(t);
    }
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#23002f] to-[#0b0014] p-4">
      <h3 className="text-sm font-semibold mb-3">Live Ticker</h3>
      <div className="space-y-2">
        {leaders.map((l,i)=>(
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/6">
            <span className="text-xs">{i+1}. {l.name}</span>
            <span className="text-xs text-cyan-300 font-semibold">{TOKENS.short} {l.energy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
