import Link from "next/link";
import { Play } from "lucide-react";

export default function TrackRow({ t }: { t: { id: string; title: string; artist?: string | null } }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm">{t.title}</div>
        {t.artist && <div className="text-xs text-white/60">{t.artist}</div>}
      </div>
      <Link href={`/track/${t.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-xs">
        <Play className="w-3 h-3" /> Play
      </Link>
    </div>
  );
}
