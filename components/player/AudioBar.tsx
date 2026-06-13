"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "./usePlayer";
import { SkipBack, SkipForward, Play, Pause, X, Heart, Plus, Share2, Music2 } from "lucide-react";

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { queue, index, playing, expanded, currentTime, duration, next, prev, play, pause, setExpanded, setProgress } = usePlayer();
  const current = index >= 0 ? queue[index] : null;

  useEffect(() => {
    if (!audioRef.current || !current) return;
    audioRef.current.src = current.streamHref;
    if (playing) audioRef.current.play().catch(() => {});
  }, [current?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  const onTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime, audioRef.current.duration || 0);
    }
  }, [setProgress]);

  const seekTo = useCallback((pct: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = pct * duration;
    }
  }, [duration]);

  if (!current) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ═══ FULL SCREEN PLAYER ═══
  if (expanded) {
    return (
      <>
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "#0D0D0D" }}
        >
          {/* Close */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setExpanded(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Artwork */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-full max-w-xs aspect-square relative rounded-2xl overflow-hidden shadow-2xl mb-8">
              {current.artworkUrl ? (
                <Image src={current.artworkUrl} alt={current.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <Music2 className="h-16 w-16 text-white/20" />
                </div>
              )}
            </div>

            {/* Track info */}
            <h2 className="text-white font-bold text-xl text-center truncate w-full max-w-xs">
              {current.title}
            </h2>
            <p className="text-white/60 text-base mt-1 text-center truncate w-full max-w-xs">
              {current.artist}
            </p>
            {current.platform && current.platform !== "jamfind" && (
              <span className="mt-2 px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                {current.platform}
              </span>
            )}
          </div>

          {/* Scrubber */}
          <div className="px-8 mb-2">
            <div
              className="relative w-full h-11 flex items-center cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekTo((e.clientX - rect.left) / rect.width);
              }}
            >
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progressPct}%`, backgroundColor: "#F4A500" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40 -mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 pb-4">
            <button onClick={prev} className="w-14 h-14 flex items-center justify-center">
              <SkipBack className="h-7 w-7 text-white" />
            </button>
            <button
              onClick={() => (playing ? pause() : play())}
              className="w-16 h-16 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#F4A500" }}
            >
              {playing ? <Pause className="h-8 w-8 text-black" /> : <Play className="h-8 w-8 text-black ml-1" />}
            </button>
            <button onClick={next} className="w-14 h-14 flex items-center justify-center">
              <SkipForward className="h-7 w-7 text-white" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-6 pb-8">
            <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80">
              <Heart className="h-5 w-5" />
              <span className="text-[10px]">Favorite</span>
            </button>
            <Link href="/submit" className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80">
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Add to 10</span>
            </Link>
            <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80">
              <Share2 className="h-5 w-5" />
              <span className="text-[10px]">Share</span>
            </button>
          </div>
        </div>
        <audio ref={audioRef} onEnded={next} onTimeUpdate={onTimeUpdate} />
      </>
    );
  }

  // ═══ MINI BAR ═══
  return (
    <div className="fixed bottom-14 md:bottom-4 left-0 right-0 z-40 px-2">
      <div
        className="rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden"
        style={{ height: "64px" }}
      >
        {/* Mini progress bar on top */}
        <div className="w-full h-0.5 bg-white/10">
          <div className="h-full" style={{ width: `${progressPct}%`, backgroundColor: "#F4A500" }} />
        </div>

        <div className="flex items-center gap-3 px-3 h-full">
          {/* Tap to expand */}
          <button
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            onClick={() => setExpanded(true)}
          >
            {current.artworkUrl ? (
              <Image src={current.artworkUrl} alt="" width={44} height={44} className="rounded-lg shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-white/30" />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm text-white font-medium">{current.title}</div>
              <div className="truncate text-xs text-white/50">{current.artist}</div>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={prev}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <SkipBack className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => (playing ? pause() : play())}
              className="w-11 h-11 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#F4A500" }}
            >
              {playing ? <Pause className="h-5 w-5 text-black" /> : <Play className="h-5 w-5 text-black ml-0.5" />}
            </button>
            <button
              onClick={next}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={next} onTimeUpdate={onTimeUpdate} />
    </div>
  );
}
