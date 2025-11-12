import { useState } from "react";
import type { Track } from "lib/types";

export function useUnifiedSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = async (query: string) => {
    setLoading(true); 
    setError(null); 
    setQ(query);
    try {
      console.log('Searching for:', query);
      const r = await fetch(`/api/search/all?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      console.log('Response status:', r.status);
      const j = await r.json();
      console.log('Response data:', j);
      console.log('Items found:', j.items?.length || 0);
      setItems(j.items || []);
    } catch (e: any) { 
      console.error('Search error:', e);
      setError(e.message || "Search failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const clear = () => {
    setQ("");
    setItems([]);
    setError(null);
  };

  return { q, setQ, loading, items, error, run, clear };
}