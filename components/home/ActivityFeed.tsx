"use client";
import { useEffect, useState } from "react";
import { glowCard } from "lib/ui";

export default function ActivityFeed() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/home/activity", { cache: "no-store" });
      if (r.ok) setRows(await r.json()); else setRows([]);
    })();
  }, []);
  return (
    <section className={`${glowCard} overflow-hidden`}>
      <div className="px-4 py-3 border-b border-white/10 text-sm text-white/70">Activity</div>
      {!rows?.length ? (
        <div className="px-4 py-10 text-center text-white/60">No activity yet.</div>
      ) : (
        <ul className="divide-y divide-white/10">
          {rows.map((a:any)=>(
            <li key={a.id} className="px-4 py-3 text-sm">
              <span className="text-white/90 font-medium">{a.user}</span>{" "}
              <span className="text-white/80">{a.text}</span>
              <span className="text-white/40 text-xs ml-2">{new Date(a.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
