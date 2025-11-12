"use client";
import { useEffect, useState } from "react";

type NewsItem = {
  id: string; title: string; source: string; summary: string;
  imageUrl?: string | null; publishedAt: string;
};

export default function NewsList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load(p = 1) {
    setLoading(true);
    const res = await fetch(`/api/news?page=${p}&limit=6`, { cache: "no-store" });
    const data = await res.json();
    if (p === 1) setItems(data.items);
    else setItems(prev => [...prev, ...data.items]);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  const canMore = items.length < total;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(n => (
          <article key={n.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-0 overflow-hidden">
            <div className="w-full aspect-video bg-white/5 flex items-center justify-center text-xs text-white/50">News Image</div>
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-1">{n.title}</h3>
              <p className="text-xs text-white/60 line-clamp-2">{n.summary}</p>
              <div className="text-[11px] text-white/40 mt-2 flex items-center justify-between">
                <span>{n.source}</span>
                <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        {canMore ? (
          <button
            disabled={loading}
            onClick={() => { const next = page + 1; setPage(next); load(next); }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
          >
            {loading ? "Loading…" : "See more"}
          </button>
        ) : (
          <div className="text-sm text-white/50">You're all caught up.</div>
        )}
      </div>
    </div>
  );
}
