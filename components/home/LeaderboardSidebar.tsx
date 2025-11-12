"use client";
import { useEffect, useState } from "react";

type Entry = { name: string; xp: number; rank: number; avatar?: string };

export default function LeaderboardSidebar() {
  const [leaders, setLeaders] = useState<Entry[]>([]);

  useEffect(() => {
    // Mock data — will later use /api/leaderboard
    setLeaders([
      { name: "DJ Kuda", xp: 1840, rank: 1 },
      { name: "SnowQueen", xp: 1720, rank: 2 },
      { name: "Tester", xp: 1650, rank: 3 },
      { name: "BeachBum", xp: 1490, rank: 4 },
    ]);
  }, []);

  return (
    <aside className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a0028] to-[#000000]/70 backdrop-blur-xl p-4 text-sm w-full md:w-64 shrink-0">
      <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        🏆 Top Players
      </h3>
      <ul className="space-y-2">
        {leaders.map((l) => (
          <li
            key={l.rank}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${l.rank === 1 ? "bg-fuchsia-500/20" : "bg-white/5"}`}
          >
            <span>
              <span className="text-white/80 font-semibold">{l.rank}. {l.name}</span>
            </span>
            <span className="text-cyan-300 font-bold">{l.xp} XP</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
