"use client";
import { useEffect, useState } from "react";

export default function RadioBanner() {
  const [now, setNow] = useState<{title:string; subtitle:string} | null>(null);
  useEffect(() => {
    let closed = false;
    try {
      const es = new EventSource("/api/lounge/now-playing?sse=1");
      es.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.now) {
          setNow({ 
            title: d.now.title, 
            subtitle: `Live Arena — vote to boost your pick • Ends in ${Math.round((new Date(d.now.endsAt).getTime() - Date.now()) / (60 * 60 * 1000))}h` 
          });
        }
      };
      es.onerror = () => es.close();
      return () => { closed = true; es.close(); };
    } catch {
      const load = async () => {
        const r = await fetch("/api/lounge/now-playing").then(r=>r.json());
        if (!closed && r.now) {
          setNow({ 
            title: r.now.title, 
            subtitle: `Live Arena — vote to boost your pick • Ends in ${Math.round((new Date(r.now.endsAt).getTime() - Date.now()) / (60 * 60 * 1000))}h` 
          });
        }
      };
      load();
      const t = setInterval(load, 10000);
      return () => clearInterval(t);
    }
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#8b5cf6]/20 via-[#ec4899]/20 to-[#14b8a6]/20 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{now?.title}</div>
          <div className="text-xs text-white/70">{now?.subtitle}</div>
        </div>
        <button className="px-4 py-2 text-xs rounded-full bg-white/10 hover:bg-white/20 transition">Tune In</button>
      </div>
    </div>
  );
}
