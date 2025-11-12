"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import RankDelta from "./RankDelta";

export default function ChartRow({
  rank, title, artist, plays, artworkUrl, delta, trackId,
}: {
  rank:number; title:string; artist:string; plays:number; artworkUrl?:string|null; delta?:number|null; trackId:string;
}) {
  const isTopTrack = rank === 1;
  
  return (
    <>
      {/* Desktop Row */}
      <motion.tr 
        className={[
          "group border-t border-white/5 even:bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:scale-[1.01] hidden md:table-row",
          isTopTrack ? "bg-gradient-to-r from-[#ec4899]/10 via-[#8b5cf6]/10 to-transparent" : ""
        ].join(" ")}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.02, type: 'spring', damping: 20, stiffness: 120 }}
      >
        <td className="w-16 px-4 py-3 text-center align-middle">
          {rank === 1 ? (
            <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full
                            bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] text-white
                            shadow-[0_0_14px_rgba(236,72,153,0.55)] ring-2 ring-white/30 animate-bounce-slow">
              👑
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full
                            bg-gradient-to-br from-[#ec4899]/60 to-[#8b5cf6]/60
                            text-white font-semibold shadow-[0_0_10px_rgba(236,72,153,0.35)]">
              {rank}
            </div>
          )}
        </td>
        <td className="w-16 px-4 py-3">
          {artworkUrl
            ? <Image src={artworkUrl} alt={title} width={44} height={44} className="rounded-lg" />
            : <div className="w-11 h-11 rounded-lg bg-white/10" />}
        </td>
        <td className="px-4 py-3">
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="text-xs text-white/70">{artist}</div>
        </td>
        <td className="w-28 px-4 py-3 text-right tabular-nums text-sm text-white/80">{plays}</td>
        <td className="w-16 px-4 py-3 text-center">
          <RankDelta delta={delta} />
        </td>
        <td className="w-28 px-4 py-3 text-right whitespace-nowrap">
          <a 
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-medium hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all inline-block"
            href={`/stream/${trackId}`}
          >
            ▶ Play
          </a>
        </td>
      </motion.tr>

      {/* Mobile Row */}
      <motion.tr 
        className={[
          "group border-t border-white/5 even:bg-white/[0.02] hover:bg-white/[0.05] transition-all md:hidden",
          isTopTrack ? "bg-gradient-to-r from-[#ec4899]/10 via-[#8b5cf6]/10 to-transparent" : ""
        ].join(" ")}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.02, type: 'spring', damping: 20, stiffness: 120 }}
      >
        <td className="w-16 px-4 py-3 text-center align-middle">
          <div className="w-6 h-6 mx-auto flex items-center justify-center rounded-full">
            {rank === 1 ? (
              <div className="w-6 h-6 flex items-center justify-center rounded-full
                              bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] text-white
                              shadow-[0_0_12px_rgba(236,72,153,0.55)] ring-2 ring-white/30 animate-bounce-slow">
                👑
              </div>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center rounded-full
                              bg-gradient-to-br from-[#ec4899]/60 to-[#8b5cf6]/60
                              text-white font-semibold text-[13px] shadow-[0_0_8px_rgba(236,72,153,0.35)]">
                {rank}
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-[13px] font-medium text-white">{title}</div>
          <div className="text-[11px] text-white/70">{artist}</div>
          <div className="text-[11px] text-white/60 mt-1">{plays} plays</div>
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <div className="flex flex-col items-end gap-1">
            <RankDelta delta={delta} />
            <a 
              className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-medium text-[11px] hover:shadow-[0_0_10px_rgba(236,72,153,0.6)] transition-all inline-block"
              href={`/stream/${trackId}`}
            >
              ▶
            </a>
          </div>
        </td>
      </motion.tr>
    </>
  );
}
