"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { glowCard, glowPink, glowCyan } from "lib/ui";

export default function Highlights() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/home/highlights", { cache: "no-store" });
      if (r.ok) setData(await r.json());
    })();
  }, []);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className={`${glowCard} ${glowPink} p-6`}>
        <div className="text-xs text-white/60 mb-1">Top playlist this week</div>
        {data?.topPlaylist ? (
          <>
            <div className="text-lg font-semibold">{data.topPlaylist.title}</div>
            <div className="text-xs text-white/60">by {data.topPlaylist.owner} • {data.topPlaylist.tracks} tracks</div>
            <Link href={`/playlists/${data.topPlaylist.id}`} className="mt-3 inline-block text-sm underline">Open</Link>
          </>
        ) : <div className="text-white/50 text-sm">—</div>}
      </div>
      <div className={`${glowCard} ${glowCyan} p-6`}>
        <div className="text-xs text-white/60 mb-1">Trending category</div>
        <div className="text-lg font-semibold">{data?.trendingCategory ?? "—"}</div>
        <div className="text-xs text-white/60 mt-1">Based on recent submissions</div>
      </div>
      <div className={`${glowCard} p-6`}>
        <div className="text-xs text-white/60 mb-1">Friends' most liked track</div>
        {data?.friendsMostLiked ? (
          <>
            <div className="text-lg font-semibold">Track ID: {data.friendsMostLiked.trackId}</div>
            <div className="text-xs text-white/60">{data.friendsMostLiked.likes} likes</div>
          </>
        ) : <div className="text-white/50 text-sm">—</div>}
      </div>
    </div>
  );
}
