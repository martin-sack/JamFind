"use client";
import { useEffect, useState } from "react";
import DiscoverRow from "components/discover/DiscoverRow";

type Item = { id:string; title:string; artistName:string; artworkUrl?:string|null; streamHref:string; plays?:number|null; delta?:number|null };

export default function SearchResults({ q }: { q: string }) {
  const [items, setItems] = useState<Item[]|null>(null);

  useEffect(() => {
    if (!q) { setItems(null); return; }
    (async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&includeExternal=true`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.tracks ?? []);
    })();
  }, [q]);

  if (!q) return null;

  return (
    <div className="card p-0 overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-white/5 text-sm text-white/70">Results for "{q}"</div>
      <table className="w-full text-left table-fixed border-collapse">
        <thead className="sticky top-0 bg-jf-surface/80 backdrop-blur border-b border-white/5">
          <tr className="text-jf-subtext text-xs">
            <th className="w-16 px-4 py-3 text-center">#</th>
            <th className="w-16 px-4 py-3">Cover</th>
            <th className="px-4 py-3">Track</th>
            <th className="w-28 px-4 py-3 text-right">Plays</th>
            <th className="w-16 px-4 py-3 text-center">Δ</th>
            <th className="w-28 px-4 py-3 text-right">Play</th>
          </tr>
        </thead>
        <tbody>
          {!items ? (
            <tr><td colSpan={6} className="py-10 text-center text-jf-subtext">Searching…</td></tr>
          ) : items.length ? (
            items.map((it, i) => <DiscoverRow key={it.id} i={i} item={it} list={items} />)
          ) : (
            <tr><td colSpan={6} className="py-10 text-center text-jf-subtext">No results.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
