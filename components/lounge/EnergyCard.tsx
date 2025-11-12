"use client";
import { TOKENS } from "lib/labels";

export default function EnergyCard({ value = 0 }: { value: number }) {
  const pct = Math.min(100, (value % 1000) / 10); // next tier every 1000
  return (
    <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-[#1a0028] to-black/80 p-5">
      <h3 className="text-sm text-fuchsia-200/80 mb-2">Your {TOKENS.name}</h3>
      <div className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="mt-4 h-3 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/60">{1000 - (value % 1000)} {TOKENS.name} to next tier</p>
    </div>
  );
}
