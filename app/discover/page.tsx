"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Heart, Play, MapPin, Loader2, Music2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { playTrack } from "@/lib/playTrack";

interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  originCity: string;
  originCountry: string;
  genreTag: string;
  platform: string;
  artworkUrl: string;
  playCount: number;
  favoriteCount: number;
  streamUrl?: string | null;
}

const REGIONS = [
  { key: "all", label: "All" },
  { key: "west-africa", label: "West Africa" },
  { key: "east-africa", label: "East Africa" },
  { key: "southern-africa", label: "Southern Africa" },
  { key: "north-africa", label: "North Africa" },
  { key: "central-africa", label: "Central Africa" },
];

const GENRES = [
  "All Genres", "Afrobeats", "Amapiano", "Highlife", "Bongo Flava",
  "Gengetone", "Afropunk", "Gqom", "Juju", "Makossa", "Afropop",
  "Dancehall", "Hip-Hop", "R&B", "Gospel",
];

const COUNTRY_FLAGS: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GH: "\u{1F1EC}\u{1F1ED}", ZA: "\u{1F1FF}\u{1F1E6}",
  KE: "\u{1F1F0}\u{1F1EA}", TZ: "\u{1F1F9}\u{1F1FF}", UG: "\u{1F1FA}\u{1F1EC}",
  SN: "\u{1F1F8}\u{1F1F3}", CM: "\u{1F1E8}\u{1F1F2}", CI: "\u{1F1E8}\u{1F1EE}",
  ET: "\u{1F1EA}\u{1F1F9}", EG: "\u{1F1EA}\u{1F1EC}", MA: "\u{1F1F2}\u{1F1E6}",
  CD: "\u{1F1E8}\u{1F1E9}",
};

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria", GH: "Ghana", ZA: "South Africa", KE: "Kenya",
  TZ: "Tanzania", UG: "Uganda", SN: "Senegal", CM: "Cameroon",
  CI: "Ivory Coast", ET: "Ethiopia", EG: "Egypt", MA: "Morocco", CD: "DR Congo",
};

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<DiscoverTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [region, setRegion] = useState("all");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("trending");
  const [search, setSearch] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingPlayId, setLoadingPlayId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch tracks
  const fetchTracks = useCallback(async (p: number, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: p.toString(),
        sort,
        ...(region !== "all" && { region }),
        ...(genre && { genre }),
      });
      const res = await fetch("/api/discover?" + params);
      const data = await res.json();
      const newTracks: DiscoverTrack[] = data.tracks || [];

      if (append) {
        setTracks((prev) => [...prev, ...newTracks]);
      } else {
        setTracks(newTracks);
      }
      setHasMore(newTracks.length >= 20);
    } catch {
      if (!append) setTracks([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [region, genre, sort]);

  // Initial load + filter changes
  useEffect(() => {
    setPage(1);
    fetchTracks(1);
  }, [fetchTracks]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTracks(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loadingMore, fetchTracks]);

  // Client-side search filter
  const filteredTracks = search.length >= 2
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.artist.toLowerCase().includes(search.toLowerCase())
      )
    : tracks;

  // Play handler
  const handlePlay = async (t: DiscoverTrack) => {
    setLoadingPlayId(t.id);
    try {
      await playTrack({
        id: t.id,
        title: t.title,
        artist: t.artist,
        artworkUrl: t.artworkUrl,
        platform: t.platform,
        streamUrl: t.streamUrl,
      });
      setPlayingId(t.id);
    } catch {
      // stream unavailable
    } finally {
      setLoadingPlayId(null);
    }
  };

  // Like handler
  const handleLike = async (trackId: string) => {
    if (!session?.user) {
      // Could show a sign-in prompt here
      window.location.href = "/login";
      return;
    }
    // Optimistic
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
    try {
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(trackId)) next.delete(trackId);
        else next.add(trackId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      {/* ─── Sticky filters ─── */}
      <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/5 pb-3 pt-4 px-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks, artists, or genres..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F4A500]/50"
            style={{ height: "44px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-white/40" />
            </button>
          )}
        </div>

        {/* Region chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {REGIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRegion(r.key)}
              className={"shrink-0 px-4 rounded-full text-xs font-medium transition-colors " +
                (region === r.key ? "text-black" : "text-white/60 hover:text-white/80 bg-white/[0.06]")}
              style={{
                height: "36px",
                ...(region === r.key ? { backgroundColor: "#F4A500" } : {}),
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Genre chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {GENRES.map((g) => {
            const key = g === "All Genres" ? "" : g;
            return (
              <button
                key={g}
                onClick={() => setGenre(key)}
                className={"shrink-0 px-3 rounded-full text-xs font-medium transition-colors " +
                  (genre === key ? "text-black" : "text-white/60 hover:text-white/80 bg-white/[0.06]")}
                style={{
                  height: "32px",
                  ...(genre === key ? { backgroundColor: "#F4A500" } : {}),
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Track list ─── */}
      <div className="px-4 py-4 space-y-2 pb-32">
        {/* Loading skeleton */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </div>
          ))}

        {/* Empty state */}
        {!loading && filteredTracks.length === 0 && (
          <div className="text-center py-16">
            <Music2 className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No tracks found for that filter</p>
            <button
              onClick={() => { setRegion("all"); setGenre(""); setSearch(""); }}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#F4A500", color: "#000" }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Track cards */}
        {!loading &&
          filteredTracks.map((t) => (
            <div key={t.id} className="flex gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
              {/* Artwork — tap goes to track page */}
              <Link href={t.id.startsWith("demo-") ? "#" : "/track/" + t.id} className="shrink-0">
                {t.artworkUrl ? (
                  <Image src={t.artworkUrl} alt={t.title} width={64} height={64} className="rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                    <Music2 className="h-6 w-6 text-white/20" />
                  </div>
                )}
              </Link>

              {/* Info — tap goes to track page */}
              <Link href={t.id.startsWith("demo-") ? "#" : "/track/" + t.id} className="flex-1 min-w-0 py-0.5">
                <p className="text-white font-medium text-[15px] truncate">{t.title}</p>
                <p className="text-white/50 text-[13px] truncate">{t.artist}</p>

                {/* Origin — always visible, teal */}
                {t.originCountry && (
                  <p className="text-[12px] mt-0.5 flex items-center gap-1" style={{ color: "#0F6E56" }}>
                    <MapPin className="h-3 w-3" />
                    {COUNTRY_FLAGS[t.originCountry] || ""}{" "}
                    {t.originCity ? t.originCity + ", " : ""}
                    {COUNTRY_NAMES[t.originCountry] || t.originCountry}
                  </p>
                )}

                {/* Genre + stats */}
                <div className="flex items-center gap-2 mt-1">
                  {t.genreTag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/50">{t.genreTag}</span>
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-white/30">
                    <Heart className="h-2.5 w-2.5" /> {formatCount(t.favoriteCount)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-white/30">
                    <Play className="h-2.5 w-2.5" /> {formatCount(t.playCount)}
                  </span>
                </div>
              </Link>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handlePlay(t)}
                  disabled={loadingPlayId === t.id}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-[#F4A500] transition-colors"
                >
                  {loadingPlayId === t.id ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => handleLike(t.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors"
                >
                  <Heart
                    className="h-5 w-5 transition-colors"
                    style={{ color: likedIds.has(t.id) ? "#ef4444" : "#6B7280" }}
                    fill={likedIds.has(t.id) ? "#ef4444" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 text-[#F4A500] animate-spin" />
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={observerRef} className="h-1" />
      </div>

      {/* Hide scrollbars on chips */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
