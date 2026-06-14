"use client";

import { useEffect, useState } from "react";
import { Play, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Image from "next/image";
import { playTrack } from "@/lib/playTrack";

type Row = {
  rank: number;
  prevRank?: number | null;
  delta?: number | null;
  plays: number;
  trackId: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
};

const REGIONS = ["Global", "Ghana", "Nigeria", "South Africa", "Kenya"];

export default function ChartsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [region, setRegion] = useState("Global");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/charts/weekly")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setRows(d.data || []))
      .catch(() => {
        setRows([
          { rank: 1, title: "Last Last", artist: "Burna Boy", plays: 12500, trackId: "1", delta: 2 },
          { rank: 2, title: "Calm Down", artist: "Rema", plays: 11800, trackId: "2", delta: -1 },
          { rank: 3, title: "Essence", artist: "Wizkid", plays: 10900, trackId: "3", delta: 5 },
          { rank: 4, title: "Love Nwantiti", artist: "CKay", plays: 9800, trackId: "4", delta: 0 },
          { rank: 5, title: "Peru", artist: "Fireboy DML", plays: 9200, trackId: "5", delta: 3 },
          { rank: 6, title: "Soweto", artist: "Victony", plays: 8700, trackId: "6", delta: -2 },
          { rank: 7, title: "Bandana", artist: "Asake", plays: 8100, trackId: "7", delta: 8 },
          { rank: 8, title: "Rush", artist: "Ayra Starr", plays: 7600, trackId: "8", delta: -1 },
          { rank: 9, title: "Terminator", artist: "King Promise", plays: 7200, trackId: "9", delta: 4 },
          { rank: 10, title: "Water", artist: "Tyla", plays: 6800, trackId: "10", delta: -3 },
        ]);
      });
  }, []);

  const handlePlay = async (r: Row) => {
    setPlayingId(r.trackId);
    try {
      await playTrack({ id: r.trackId, title: r.title, artist: r.artist, artworkUrl: r.artworkUrl });
    } catch {}
    finally { setPlayingId(null); }
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Top Charts</h1>
        <p className="text-white/50 text-sm mt-1">Updated weekly based on streams across JamFind</p>
      </div>

      {/* Region chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={"shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors " +
              (region === r ? "text-black" : "text-white/60 bg-white/[0.06]")}
            style={region === r ? { backgroundColor: "#F4A500" } : {}}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart list */}
      <div className="space-y-1">
        {rows === null && (
          <div className="py-12 text-center">
            <Loader2 className="h-6 w-6 text-white/30 animate-spin mx-auto" />
          </div>
        )}

        {rows?.map((r) => (
          <div
            key={r.trackId}
            className={"flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors " +
              (r.rank <= 3 ? "bg-white/[0.02]" : "")}
          >
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              <span className={"text-sm font-bold tabular-nums " +
                (r.rank === 1 ? "text-[#F4A500]" : r.rank <= 3 ? "text-white" : "text-white/40")}>
                {r.rank}
              </span>
            </div>

            {/* Delta */}
            <div className="w-6 shrink-0 flex justify-center">
              {r.delta == null ? (
                <span className="text-[10px] text-white/30 font-medium">NEW</span>
              ) : r.delta > 0 ? (
                <div className="flex items-center text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-[10px] ml-0.5">{r.delta}</span>
                </div>
              ) : r.delta < 0 ? (
                <div className="flex items-center text-red-400">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-[10px] ml-0.5">{Math.abs(r.delta)}</span>
                </div>
              ) : (
                <Minus className="h-3 w-3 text-white/20" />
              )}
            </div>

            {/* Artwork */}
            {r.artworkUrl ? (
              <Image src={r.artworkUrl} alt={r.title} width={44} height={44} className="rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-white/10 shrink-0" />
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{r.title}</p>
              <p className="text-white/50 text-xs truncate">{r.artist}</p>
            </div>

            {/* Plays */}
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-white/40 text-xs tabular-nums">{r.plays.toLocaleString()}</p>
              <p className="text-white/20 text-[10px]">streams</p>
            </div>

            {/* Play */}
            <button
              onClick={() => handlePlay(r)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-[#F4A500] transition-colors shrink-0"
            >
              {playingId === r.trackId ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-white ml-0.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-white/20 text-xs py-8">
        Charts refresh every Monday
      </p>
    </div>
  );
}
