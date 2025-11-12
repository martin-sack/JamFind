"use client";
import Image from "next/image";
import RankDelta from "./RankDelta";

export default function PlaylistRow({
  rank, playlistTitle, ownerName, plays, coverUrl, delta, playlistId,
}: {
  rank:number; playlistTitle:string; ownerName:string; plays:number; coverUrl?:string|null; delta?:number|null; playlistId:string;
}) {
  return (
    <tr className="group border-t border-white/5 hover:bg-white/5 transition">
      {/* rank (uses same fixed width as header) */}
      <td className="w-16 px-4 py-3 text-center align-middle">
        <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full
                        bg-gradient-to-br from-[#ec4899]/60 to-[#8b5cf6]/60
                        text-white font-semibold shadow-[0_0_10px_rgba(236,72,153,0.35)]">
          {rank}
        </div>
      </td>

      {/* cover */}
      <td className="w-16 px-4 py-3">
        {coverUrl ? (
          <Image src={coverUrl} alt={playlistTitle} width={44} height={44} className="rounded-lg" />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-white/10" />
        )}
      </td>

      {/* playlist title + from who */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-white">{playlistTitle}</div>
        <div className="text-xs text-white/70">from {ownerName}</div>
      </td>

      {/* plays */}
      <td className="w-28 px-4 py-3 text-right tabular-nums text-sm text-white/80">{plays}</td>

      {/* delta */}
      <td className="w-16 px-4 py-3 text-center">
        <RankDelta delta={delta} />
      </td>

      {/* CTA: open playlist page (or play-first-track fallback) */}
      <td className="w-28 px-4 py-3 text-right whitespace-nowrap">
        <a className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-medium hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition inline-block"
           href={`/playlist/${playlistId}`}>
          ▶ View
        </a>
      </td>
    </tr>
  );
}
