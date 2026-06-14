"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Users } from "lucide-react";

const REGIONS = ["Global", "Ghana", "Nigeria", "South Africa", "Kenya"];

const MOCK_CURATORS = [
  { rank: 1, name: "DJ Kuda", handle: "@djkuda", country: "GH", picks: 48, influence: 2840, streak: 12 },
  { rank: 2, name: "Lagos Ears", handle: "@lagosears", country: "NG", picks: 52, influence: 2650, streak: 8 },
  { rank: 3, name: "Amapiano Queen", handle: "@amaqween", country: "ZA", picks: 41, influence: 2200, streak: 15 },
  { rank: 4, name: "BeachBum", handle: "@beachbum", country: "GH", picks: 39, influence: 1900, streak: 6 },
  { rank: 5, name: "NaijaVibes", handle: "@naijavibes", country: "NG", picks: 45, influence: 1750, streak: 10 },
  { rank: 6, name: "Kampala Sounds", handle: "@kampalasounds", country: "UG", picks: 33, influence: 1580, streak: 4 },
  { rank: 7, name: "TasteKE", handle: "@tasteke", country: "KE", picks: 37, influence: 1420, streak: 7 },
  { rank: 8, name: "Accra After Dark", handle: "@accraafterdark", country: "GH", picks: 29, influence: 1200, streak: 3 },
  { rank: 9, name: "SowetoBass", handle: "@sowetobass", country: "ZA", picks: 31, influence: 1100, streak: 5 },
  { rank: 10, name: "WestSide", handle: "@westside", country: "NG", picks: 28, influence: 980, streak: 2 },
];

const FLAGS: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GH: "\u{1F1EC}\u{1F1ED}", ZA: "\u{1F1FF}\u{1F1E6}",
  KE: "\u{1F1F0}\u{1F1EA}", UG: "\u{1F1FA}\u{1F1EC}",
};

export default function LeaderboardClient() {
  const [region, setRegion] = useState("Global");

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto" style={{ backgroundColor: "#0D0D0D" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Top Curators</h1>
        <p className="text-white/50 text-sm mt-1">People with the best taste this season</p>
      </div>

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

      <div className="grid grid-cols-3 gap-3 mb-8">
        {MOCK_CURATORS.slice(0, 3).map((c, i) => (
          <div key={c.rank} className={"rounded-2xl p-4 text-center border " + (i === 0 ? "border-[#F4A500]/30 bg-[#F4A500]/[0.06]" : "border-white/5 bg-white/[0.02]")}>
            <div className={"w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold " + (i === 0 ? "bg-[#F4A500] text-black" : i === 1 ? "bg-white/20 text-white" : "bg-white/10 text-white/60")}>
              {c.rank}
            </div>
            <p className="text-white text-sm font-medium truncate">{c.name}</p>
            <p className="text-white/40 text-xs">{FLAGS[c.country] || ""} {c.handle}</p>
            <p className="text-[#F4A500] text-xs font-medium mt-2">{c.influence.toLocaleString()} influence</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {MOCK_CURATORS.map((c) => (
          <div key={c.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
            <span className={"w-8 text-center text-sm font-bold tabular-nums " + (c.rank <= 3 ? "text-[#F4A500]" : "text-white/40")}>{c.rank}</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-medium shrink-0">{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{c.name}</p>
              <p className="text-white/40 text-xs">{FLAGS[c.country] || ""} {c.handle}</p>
            </div>
            <div className="text-right shrink-0 space-y-0.5">
              <p className="text-white/60 text-xs tabular-nums">{c.influence.toLocaleString()}</p>
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">{c.streak}w streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {[
          { icon: Users, value: "1.2k", label: "Active curators" },
          { icon: Trophy, value: "48", label: "Weeks tracked" },
          { icon: TrendingUp, value: "15.2k", label: "Picks submitted" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] p-4 text-center">
            <s.icon className="h-5 w-5 text-white/30 mx-auto mb-1" />
            <p className="text-white font-medium text-sm">{s.value}</p>
            <p className="text-white/30 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
