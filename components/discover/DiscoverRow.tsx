"use client";
import Image from "next/image";
import { usePlayer } from "components/player/usePlayer";
import RankDelta from "components/Charts/RankDelta";

export default function DiscoverRow({
  i, item, list
}: {
  i: number;
  item: {
    id: string;
    title: string;
    artistName: string;
    artworkUrl?: string | null;
    streamHref: string;
    delta?: number | null;
    plays?: number | null;
    platform?: string;
    isLocal?: boolean;
    externalUrl?: string;
    duration?: number;
  };
  list: any[];
}) {
  const queue = list.map((t:any) => ({
    id: t.id, title: t.title, artist: t.artistName,
    streamHref: t.streamHref, artworkUrl: t.artworkUrl,
    platform: t.platform, isLocal: t.isLocal, externalUrl: t.externalUrl
  }));

  return (
    <tr className="group border-t border-white/5 hover:bg-white/5 transition">
      {/* # */}
      <td className="w-16 px-4 py-3 text-center align-middle">
        <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full
                        bg-gradient-to-br from-[#ec4899]/60 to-[#8b5cf6]/60
                        text-white font-semibold shadow-[0_0_10px_rgba(236,72,153,0.35)]">
          {i + 1}
        </div>
      </td>

      {/* Cover */}
      <td className="w-16 px-4 py-3">
        {item.artworkUrl ? (
          <Image src={item.artworkUrl} alt={item.title} width={44} height={44} className="rounded-lg" />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-white/10" />
        )}
      </td>

      {/* Track / Artist */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium">{item.title}</div>
            <div className="text-xs text-jf-subtext">{item.artistName}</div>
          </div>
          {item.platform && item.platform !== 'jamfind' && (
            <span className={`px-2 py-1 text-xs rounded-full text-white ${
              item.platform === 'audiomack' ? 'bg-orange-500' :
              item.platform === 'soundcloud' ? 'bg-orange-600' :
              item.platform === 'boomplay' ? 'bg-green-500' :
              'bg-gray-500'
            }`}>
              {item.platform}
            </span>
          )}
        </div>
      </td>

      {/* Plays (optional if provided) */}
      <td className="w-28 px-4 py-3 text-right tabular-nums">{item.plays ?? "—"}</td>

      {/* Δ (optional) */}
      <td className="w-16 px-4 py-3 text-center">
        <RankDelta delta={item.delta ?? null} />
      </td>

      {/* Play */}
      <td className="w-28 px-4 py-3 text-right whitespace-nowrap">
        {item.isLocal === false ? (
          <button
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white
                       hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition"
            onClick={() => {
              if (item.externalUrl) {
                window.open(item.externalUrl, '_blank');
              }
            }}
          >
            🔗 Open
          </button>
        ) : (
          <button
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white
                       hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition"
            onClick={() => {
              const { setQueue } = usePlayer.getState();
              setQueue(queue, i);
            }}
          >
            ▶ Play
          </button>
        )}
      </td>
    </tr>
  );
}
