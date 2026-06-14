"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ear, Compass, Music2, Play, Loader2, BarChart3, ChevronRight, Mic } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { playTrack } from "@/lib/playTrack";

interface FeaturedPlaylist {
  id: string;
  title: string;
  description: string;
  trackCount: number;
  coverArt: string | null;
  tracks: { id: string; title: string; artist: string; artworkUrl: string | null }[];
}

interface Track {
  id: string;
  title: string;
  artist: string;
  originCountry: string;
  genreTag: string;
  artworkUrl: string;
  playCount: number;
  favoriteCount: number;
  platform: string;
  streamUrl?: string | null;
}

const FLAGS: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GH: "\u{1F1EC}\u{1F1ED}", ZA: "\u{1F1FF}\u{1F1E6}",
  KE: "\u{1F1F0}\u{1F1EA}", TZ: "\u{1F1F9}\u{1F1FF}", CM: "\u{1F1E8}\u{1F1F2}",
};

export default function HomePage() {
  const { data: session } = useSession();
  const [trending, setTrending] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<FeaturedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/discover?sort=trending&page=1").then((r) => r.json()).catch(() => ({ tracks: [] })),
      fetch("/api/playlists/featured").then((r) => r.json()).catch(() => ({ playlists: [] })),
    ]).then(([discoverData, playlistData]) => {
      setTrending(discoverData.tracks?.slice(0, 6) || []);
      setPlaylists(playlistData.playlists || []);
      setLoading(false);
    });
  }, []);

  const handlePlay = async (t: Track) => {
    setPlayingId(t.id);
    setPlayError(null);
    try {
      await playTrack({ id: t.id, title: t.title, artist: t.artist, artworkUrl: t.artworkUrl, platform: t.platform, streamUrl: t.streamUrl });
    } catch (e: any) {
      setPlayError(e?.message || "Stream unavailable");
      setTimeout(() => setPlayError(null), 3000);
    }
    finally { setPlayingId(null); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Hero: Find a Song */}
      <section className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {session?.user ? "Welcome back" : "What are you listening to?"}
        </h1>
        <p className="text-white/50 text-sm mb-6">Identify, discover, and stream African music</p>

        <Link
          href="/find"
          className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 transition-all hover:border-[#F4A500]/30 hover:bg-white/[0.03]"
          style={{ background: "linear-gradient(135deg, rgba(244,165,0,0.08) 0%, rgba(244,165,0,0.02) 100%)" }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#F4A500" }}>
            <Mic className="h-6 w-6 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-base">Find a song</p>
            <p className="text-white/50 text-xs mt-0.5">Tap to listen, hum, or search by lyrics</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/30" />
        </Link>
      </section>

      {/* Quick Actions */}
      <section className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/discover" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.06] transition-colors">
            <Compass className="h-6 w-6 text-[#F4A500]" />
            <span className="text-white text-xs font-medium">Discover</span>
          </Link>
          <Link href="/charts" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.06] transition-colors">
            <BarChart3 className="h-6 w-6 text-[#F4A500]" />
            <span className="text-white text-xs font-medium">Charts</span>
          </Link>
          <Link href="/submit" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.06] transition-colors">
            <Music2 className="h-6 w-6 text-[#F4A500]" />
            <span className="text-white text-xs font-medium">Submit</span>
          </Link>
        </div>
      </section>

      {/* Trending Now */}
      <section className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-base">Trending Now</h2>
          <Link href="/discover?sort=trending" className="text-[#F4A500] text-xs font-medium flex items-center gap-1">
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {trending.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <span className="text-white/30 text-xs w-5 text-right font-medium">{i + 1}</span>
                {t.artworkUrl ? (
                  <Image src={t.artworkUrl} alt={t.title} width={48} height={48} className="rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Music2 className="h-5 w-5 text-white/20" />
                  </div>
                )}
                <Link href={t.id.startsWith("demo-") ? "#" : "/track/" + t.id} className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.title}</p>
                  <p className="text-white/50 text-xs truncate">{t.artist}{t.originCountry ? " " + (FLAGS[t.originCountry] || "") : ""}</p>
                </Link>
                <button onClick={() => handlePlay(t)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-[#F4A500] transition-colors shrink-0">
                  {playingId === t.id ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial Playlists */}
      {playlists.length > 0 && (
        <section className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Curated Playlists</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
            {playlists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlists/${pl.id}`}
                className="shrink-0 w-40 group"
              >
                <div className="w-40 h-40 rounded-xl overflow-hidden mb-2 bg-white/[0.06] relative">
                  {pl.coverArt ? (
                    <Image src={pl.coverArt} alt={pl.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="h-8 w-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">{pl.trackCount} tracks</p>
                  </div>
                </div>
                <p className="text-white text-sm font-medium truncate">{pl.title}</p>
                <p className="text-white/40 text-xs truncate">{pl.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Play error toast */}
      {playError && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-red-500/90 text-white text-sm px-4 py-3 rounded-xl text-center backdrop-blur">
          {playError}
        </div>
      )}

      {/* How JamFind Works */}
      <section className="px-6 pb-8">
        <h2 className="text-white font-semibold text-base mb-4">How it works</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(244,165,0,0.1)" }}>
              <Ear className="h-4 w-4" style={{ color: "#F4A500" }} />
            </div>
            <div><p className="text-white text-sm font-medium">Find</p><p className="text-white/40 text-xs mt-0.5">Hear a song? Tap to identify it instantly</p></div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(20,184,166,0.1)" }}>
              <Compass className="h-4 w-4" style={{ color: "#14b8a6" }} />
            </div>
            <div><p className="text-white text-sm font-medium">Discover</p><p className="text-white/40 text-xs mt-0.5">Browse trending tracks across Africa by region and genre</p></div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(139,92,246,0.1)" }}>
              <Music2 className="h-4 w-4" style={{ color: "#8b5cf6" }} />
            </div>
            <div><p className="text-white text-sm font-medium">Submit</p><p className="text-white/40 text-xs mt-0.5">Build your weekly 10 - the tracks the world needs to hear</p></div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(236,72,153,0.1)" }}>
              <BarChart3 className="h-4 w-4" style={{ color: "#ec4899" }} />
            </div>
            <div><p className="text-white text-sm font-medium">Rise</p><p className="text-white/40 text-xs mt-0.5">Community listens. The best tracks chart. Taste wins.</p></div>
          </div>
        </div>
      </section>

      {/* Sign in prompt */}
      {!session?.user && (
        <section className="px-6 pb-24">
          <div className="rounded-2xl border border-white/10 p-5 text-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.05) 100%)" }}>
            <p className="text-white font-semibold text-sm">Join the community</p>
            <p className="text-white/50 text-xs mt-1 mb-4">Sign in to save favorites, submit playlists, and climb the charts</p>
            <Link href="/login" className="inline-flex px-6 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>Sign in</Link>
          </div>
        </section>
      )}
    </div>
  );
}
