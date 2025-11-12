"use client";
import { motion } from "framer-motion";

export default function RankDelta({ delta }: { delta?: number | null }) {
  if (delta == null) return <span className="text-white/60 text-xs">NEW</span>;
  if (delta === 0) return <span className="text-white/60 text-xs">—</span>;
  const up = delta > 0;
  const arrow = up ? "▲" : "▼";
  return (
    <motion.span
      className={`${up ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'} text-xs font-medium`}
      initial={{ y: up ? 6 : -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      {arrow} {Math.abs(delta)}
    </motion.span>
  );
}
