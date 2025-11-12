"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function TrackStreamPage({ params }: { params: { id: string } }) {
  const [t, setT] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/tracks/${params.id}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed");
        setT(j);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [params.id]);

  if (err) return <div className="py-8 text-red-400">{err}</div>;
  if (!t) return <div className="py-8 text-white/60">Loading track…</div>;

  // Get signed HLS stream URL
  const streamHref = `/api/stream/${t.id}`;

  return (
    <div className="py-8 space-y-8">
      {/* Hero */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[#8b5cf6]/30 via-transparent to-[#14b8a6]/20 border border-white/10 shadow-lg shadow-black/20 flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-white/10">
          {t.artworkUrl ? (
            <Image src={t.artworkUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase text-white/60">Now Playing</p>
          <h1 className="text-3xl font-game-title mb-2">{t.title}</h1>
          <p className="text-white/70">
            by{" "}
            <Link
              className="text-white underline/30 hover:underline"
              href={`/artist/${t.artistId}`}
            >
              {t.artist?.name || "Unknown"}
            </Link>
          </p>
          <div className="mt-4 flex gap-2">
            <a
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
              href={streamHref}
            >
              ▶ Play
            </a>
            <button className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all">
              ♡ Like
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all">
              ⤴ Add to Playlist
            </button>
          </div>
        </div>
      </div>

      {/* WaveSurfer player (HLS) */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_0_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-lg p-6">
        <audio id="player" controls className="w-full">
          <source src={streamHref} type="application/vnd.apple.mpegurl" />
        </audio>
        <p className="text-xs text-white/60 mt-2">
          HLS streaming enabled. Works in modern browsers.
        </p>
      </div>

      {/* Tip / Boost */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_0_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-lg p-6">
          <h2 className="text-xl font-game-heading mb-2">Tip the Artist</h2>
          <p className="text-white/70 mb-3">Say thanks with a small tip.</p>
          <div className="flex gap-2">
            {[100, 300, 500].map((c) => (
              <button
                key={c}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                onClick={() => alert(`Tip ¢${c} (wire to payments later)`)}
              >
                ¢{c}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_0_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-lg p-6">
          <h2 className="text-xl font-game-heading mb-2">Boost This Track</h2>
          <p className="text-white/70 mb-3">Promote to more listeners.</p>
          <button
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
            onClick={() => alert("Create Boost (wire to /api/boosts/create)")}
          >
            Create Boost
          </button>
        </div>
      </div>

      {/* Related */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_0_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-lg p-6">
        <h2 className="text-xl font-game-heading mb-4">Related Tracks</h2>
        <div id="related" className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-white/60">Coming next: AI recommendations</div>
        </div>
      </div>
    </div>
  );
}
