import { useState } from "react";
import { searchAudiomack, type NormalizedTrack } from "lib/audiomack";

export function useAudiomackSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NormalizedTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = async (query: string) => {
    setQ(query);
    setLoading(true);
    setError(null);
    try {
      const items = await searchAudiomack(query);
      setResults(items);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQ("");
    setResults([]);
    setError(null);
  };

  return { q, setQ, loading, results, error, run, clear };
}