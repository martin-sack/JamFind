"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Music2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface ImportedTrack {
  title: string;
  artist: string;
  artworkUrl?: string | null;
  platform?: string;
  externalId?: string;
  isNew?: boolean;
}

interface PlaylistMeta {
  name: string;
  image?: string;
  trackCount: number;
  platform: string;
}

interface PlaylistImporterProps {
  onImport: (tracks: ImportedTrack[]) => void;
  currentTrackCount: number;
  maxTracks?: number;
}

type ImportState = "idle" | "loading" | "success" | "selecting" | "error";

function detectPlatform(url: string): { endpoint: string; body: Record<string, any> } | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("spotify.com")) {
      return { endpoint: "/api/spotify/parse", body: { url } };
    }
    if (u.hostname.includes("music.apple.com")) {
      return { endpoint: "/api/music/parse", body: { url } };
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      return { endpoint: "/api/music/parse", body: { url } };
    }
    // Default: try unified parser
    return { endpoint: "/api/music/parse", body: { url } };
  } catch {
    return null;
  }
}

export default function PlaylistImporter({ onImport, currentTrackCount, maxTracks = 10 }: PlaylistImporterProps) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ImportState>("idle");
  const [meta, setMeta] = useState<PlaylistMeta | null>(null);
  const [tracks, setTracks] = useState<ImportedTrack[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const remaining = maxTracks - currentTrackCount;

  const handleImport = async () => {
    if (!url.trim()) return;
    const detected = detectPlatform(url.trim());
    if (!detected) {
      setError("Invalid URL — paste a link from Spotify, Apple Music, or YouTube");
      setState("error");
      return;
    }

    setState("loading");
    setError("");

    try {
      const res = await fetch(detected.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detected.body),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to fetch playlist");
      }

      const data = await res.json();

      if (!data.success || !data.tracks?.length) {
        throw new Error("No tracks found in this playlist");
      }

      setMeta({
        name: data.metadata?.name || "Imported Playlist",
        image: data.metadata?.image,
        trackCount: data.tracks.length,
        platform: data.parsedLink?.platform || "unknown",
      });

      const imported: ImportedTrack[] = data.tracks.map((t: any) => ({
        title: t.title || t.name || "Unknown",
        artist: t.artist || t.artists?.[0]?.name || "Unknown",
        artworkUrl: t.artworkUrl || t.albumArt,
        platform: data.parsedLink?.platform,
        externalId: t.externalId || t.id,
        isNew: true,
      }));

      setTracks(imported);
      setState("success");
    } catch (err: any) {
      setError(err?.message || "Could not fetch that playlist");
      setState("error");
    }
  };

  const handleAddAll = () => {
    const toAdd = tracks.slice(0, remaining);
    onImport(toAdd);
    reset();
  };

  const handlePickTracks = () => {
    // Pre-select up to remaining
    const initial = new Set<number>();
    for (let i = 0; i < Math.min(tracks.length, remaining); i++) initial.add(i);
    setSelected(initial);
    setState("selecting");
  };

  const toggleTrack = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) {
      next.delete(i);
    } else if (next.size < remaining) {
      next.add(i);
    }
    setSelected(next);
  };

  const handleAddSelected = () => {
    const toAdd = Array.from(selected)
      .sort((a, b) => a - b)
      .map((i) => tracks[i]);
    onImport(toAdd);
    reset();
  };

  const reset = () => {
    setState("idle");
    setUrl("");
    setMeta(null);
    setTracks([]);
    setSelected(new Set());
    setError("");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-white font-semibold text-sm mb-1">Import from another platform</h3>
      <p className="text-white/50 text-xs mb-4">Paste a link from Spotify, Apple Music, or YouTube</p>

      {/* ─── IDLE / INPUT ─── */}
      {(state === "idle" || state === "error") && (
        <>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              placeholder="https://open.spotify.com/playlist/..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F4A500]/50"
            />
            <button
              onClick={handleImport}
              disabled={!url.trim()}
              className="px-5 py-3 rounded-xl text-sm font-medium shrink-0 disabled:opacity-40"
              style={{ backgroundColor: "#F4A500", color: "#000", minHeight: "44px" }}
            >
              Import
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Spotify</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Apple Music</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> YouTube</span>
          </div>
          {state === "error" && (
            <div className="mt-3 flex items-start gap-2 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
                <button onClick={reset} className="underline mt-1 text-white/50 hover:text-white/70">Try another link</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── LOADING ─── */}
      {state === "loading" && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="h-5 w-5 text-[#F4A500] animate-spin" />
          <span className="text-white/70 text-sm">Fetching your playlist...</span>
        </div>
      )}

      {/* ─── SUCCESS ─── */}
      {state === "success" && meta && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {meta.image ? (
              <Image src={meta.image} alt={meta.name} width={64} height={64} className="rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                <Music2 className="h-6 w-6 text-white/30" />
              </div>
            )}
            <div>
              <p className="text-white font-medium text-sm">{meta.name}</p>
              <p className="text-white/50 text-xs">{meta.trackCount} tracks · {meta.platform}</p>
            </div>
          </div>

          {/* Preview first 5 */}
          <div className="space-y-1">
            {tracks.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                <span className="text-white/30 w-5 text-right">{i + 1}</span>
                <span className="text-white truncate">{t.title}</span>
                <span className="text-white/40 truncate">{t.artist}</span>
              </div>
            ))}
            {tracks.length > 5 && (
              <p className="text-white/30 text-xs pl-7">+ {tracks.length - 5} more</p>
            )}
          </div>

          {tracks.length > remaining ? (
            <div className="space-y-2">
              <p className="text-[#F4A500] text-xs">
                Your playlist has {tracks.length} tracks. Pick your {remaining} for this week.
              </p>
              <button onClick={handlePickTracks} className="w-full px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>
                Pick tracks to add
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleAddAll} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>
                Add all to my 10
              </button>
              <button onClick={handlePickTracks} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15">
                Pick tracks
              </button>
            </div>
          )}
          <button onClick={reset} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
        </div>
      )}

      {/* ─── SELECTING ─── */}
      {state === "selecting" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm">{selected.size} of {remaining} selected</p>
            <button onClick={reset} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 -mx-1 px-1">
            {tracks.map((t, i) => (
              <button
                key={i}
                onClick={() => toggleTrack(i)}
                className={"flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors " +
                  (selected.has(i) ? "bg-[#F4A500]/10 border border-[#F4A500]/30" : "hover:bg-white/5 border border-transparent")}
              >
                <div className={"w-5 h-5 rounded-md border flex items-center justify-center shrink-0 " +
                  (selected.has(i) ? "border-[#F4A500] bg-[#F4A500]" : "border-white/20")}>
                  {selected.has(i) && <CheckCircle className="h-3 w-3 text-black" />}
                </div>
                <span className="text-white/30 w-4 text-right">{i + 1}</span>
                {t.artworkUrl && <Image src={t.artworkUrl} alt="" width={28} height={28} className="rounded shrink-0" />}
                <span className="text-white truncate flex-1">{t.title}</span>
                <span className="text-white/40 truncate max-w-[80px]">{t.artist}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleAddSelected}
            disabled={selected.size === 0}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: "#F4A500", color: "#000" }}
          >
            Add {selected.size} track{selected.size !== 1 ? "s" : ""}
          </button>
          {selected.size < remaining && selected.size > 0 && (
            <p className="text-white/40 text-[10px] text-center">
              Add more tracks to strengthen your submission
            </p>
          )}
        </div>
      )}
    </div>
  );
}
