import Link from "next/link";
import { ListMusic } from "lucide-react";

export default function PlaylistMini({ p }: { p: { id: string; title: string; count: number; updated?: string } }) {
  return (
    <Link href={`/playlists/${p.id}`} className="block rounded-xl bg-white/[0.04] border border-white/10 p-4 hover:bg-white/[0.07] transition">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
          <ListMusic className="w-5 h-5 text-white/80" />
        </div>
        <div>
          <div className="text-sm">{p.title}</div>
          <div className="text-xs text-white/60">{p.count} tracks{p.updated ? ` • ${p.updated}` : ""}</div>
        </div>
      </div>
    </Link>
  );
}
