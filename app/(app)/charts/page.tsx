"use client";

import { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import ChartRow from "components/Charts/ChartRow";

type Row = {
  rank:number; prevRank?:number|null; delta?:number|null; plays:number;
  trackId:string; title:string; artist:string; artworkUrl?:string|null;
};

export default function ChartsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/charts/weekly")
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then(d => setRows(d.data || []))
      .catch(e => {
        console.error("Error fetching chart data:", e);
        // Use mock data for demo purposes
        const mockData: Row[] = [
          { rank: 1, title: "Last Last", artist: "Burna Boy", plays: 12500, trackId: "1", delta: 2 },
          { rank: 2, title: "Calm Down", artist: "Rema", plays: 11800, trackId: "2", delta: -1 },
          { rank: 3, title: "Essence", artist: "Wizkid ft. Tems", plays: 10900, trackId: "3", delta: 5 },
          { rank: 4, title: "Love Nwantiti", artist: "CKay", plays: 9800, trackId: "4", delta: 0 },
          { rank: 5, title: "Peru", artist: "Fireboy DML", plays: 9200, trackId: "5", delta: 3 },
          { rank: 6, title: "Soweto", artist: "Victony", plays: 8700, trackId: "6", delta: -2 },
          { rank: 7, title: "Bandana", artist: "Asake", plays: 8100, trackId: "7", delta: 8 },
          { rank: 8, title: "Rush", artist: "Ayra Starr", plays: 7600, trackId: "8", delta: -1 },
          { rank: 9, title: "Terminator", artist: "King Promise", plays: 7200, trackId: "9", delta: 4 },
          { rank: 10, title: "Overloading", artist: "Mavins", plays: 6800, trackId: "10", delta: -3 },
        ];
        setRows(mockData);
        setErr("Using demo data - API temporarily unavailable");
      });
  }, []);

  return (
    <div className="py-8 space-y-8">
      {/* HERO SECTION - Enhanced gradient with neon dot */}
      <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-[#8b5cf6]/30 via-[#ec4899]/30 to-[#14b8a6]/20 border border-white/10 shadow-lg shadow-black/20 relative overflow-hidden">
        {/* Soft bottom fade shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-game-title mb-2">
              <span className="before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-[#ec4899] before:animate-pulse before:inline-block before:mr-2"></span>
              Billboard — Top 100
              <span className="ml-2 px-2 py-[2px] text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-medium animate-pulse">LIVE</span>
            </h1>
            <p className="text-white/70 text-lg">Weekly chart powered by completed streams + community signals.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Global</Button>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Ghana</Button>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Nigeria</Button>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">South Africa</Button>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER - Glass-style gradient panel */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_0_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            {/* Desktop Header */}
            <thead className="sticky top-0 bg-black/40 backdrop-blur-lg border-b border-white/5 border-t border-fuchsia-500/30 hidden md:table-header-group">
              <tr className="text-white/60 text-xs">
                <th className="w-16 px-4 py-3 text-center">#</th>
                <th className="w-16 px-4 py-3">Cover</th>
                <th className="px-4 py-3">Playlist</th>
                <th className="w-28 px-4 py-3 text-right">Plays</th>
                <th className="w-16 px-4 py-3 text-center">Δ</th>
                <th className="w-28 px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows?.map(r => <ChartRow key={r.trackId} {...r} />)}
              {rows === null && (
                <tr><td colSpan={6} className="py-8 text-center text-white/60">Loading chart…</td></tr>
              )}
              {rows?.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-white/60">No data yet — stream more tracks or run the weekly refresh.</td></tr>
              )}
              {err && (
                <tr><td colSpan={6} className="py-8 text-center text-red-400">{err}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER BANNER - Optional enhancement */}
      <div className="text-center py-6 text-sm text-white/60">
        🔥 Top 100 updated every Monday — powered by JamFind Analytics
      </div>
    </div>
  );
}
