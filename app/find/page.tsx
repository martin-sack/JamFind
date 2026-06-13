"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Ear, Music2, FileText, Loader2, Play, Search, Heart, AudioLines } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Mode = "listen" | "hum" | "lyrics";
type State = "idle" | "listening" | "processing" | "matched" | "no_match" | "permission_denied";

interface MatchResult {
  found: boolean;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  inCatalog: boolean;
  track?: {
    id: string;
    title: string;
    artist: string;
    artworkUrl?: string | null;
    genres: string;
    streamUrl?: string | null;
    platform: string;
    externalUrl?: string | null;
  };
  error?: string;
}

interface LyricsTrack {
  id: string;
  title: string;
  artist: string;
  country?: string | null;
  genre?: string;
  artworkUrl?: string | null;
  playCount: number;
  favoriteCount: number;
  platform: string;
  streamUrl?: string | null;
  externalUrl?: string | null;
}

function getSupportedMimeType(): string {
  const types = ["audio/webm", "audio/ogg", "audio/mp4"];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "audio/webm";
}

export default function FindPage() {
  const [mode, setMode] = useState<Mode>("listen");
  const [state, setState] = useState<State>("idle");
  const [countdown, setCountdown] = useState(10);
  const [result, setResult] = useState<MatchResult | null>(null);

  // Lyrics search state
  const [lyricsQuery, setLyricsQuery] = useState("");
  const [lyricsResults, setLyricsResults] = useState<LyricsTrack[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lyricsInputRef = useRef<HTMLInputElement | null>(null);

  // Quick-add form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddCity, setQuickAddCity] = useState("");
  const [quickAddCountry, setQuickAddCountry] = useState("");
  const [quickAddGenre, setQuickAddGenre] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddDone, setQuickAddDone] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startListening = useCallback(async () => {
    cleanup();
    chunksRef.current = [];
    setResult(null);
    setCountdown(10);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(blob);
      };

      recorder.start(1000);
      setState("listening");

      let secs = 10;
      countdownRef.current = setInterval(() => {
        secs--;
        setCountdown(secs);
        if (secs <= 0 && countdownRef.current) clearInterval(countdownRef.current);
      }, 1000);

      timerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 10000);
    } catch (err: any) {
      console.error("Mic error:", err);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setState("permission_denied");
      } else {
        setState("no_match");
      }
    }
  }, [cleanup]);

  const processAudio = async (blob: Blob) => {
    setState("processing");
    try {
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const endpoint = mode === "hum" ? "/api/hum-search" : "/api/identify";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64 }),
      });

      const data: MatchResult = await res.json();
      setResult(data);
      setState(data.found ? "matched" : "no_match");
    } catch (err) {
      console.error("Identify error:", err);
      setState("no_match");
    }
  };

  const resetState = () => {
    cleanup();
    setState("idle");
    setResult(null);
    setCountdown(mode === "hum" ? 15 : 10);
    setShowQuickAdd(false);
    setQuickAddDone(false);
  };

  // Hum mode uses 15s recording
  const startHumming = useCallback(async () => {
    cleanup();
    chunksRef.current = [];
    setResult(null);
    setCountdown(15);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64000 });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(blob);
      };

      recorder.start(1000);
      setState("listening");

      let secs = 15;
      countdownRef.current = setInterval(() => {
        secs--;
        setCountdown(secs);
        if (secs <= 0 && countdownRef.current) clearInterval(countdownRef.current);
      }, 1000);

      timerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 15000);
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setState("permission_denied");
      } else {
        setState("no_match");
      }
    }
  }, [cleanup, mode]);

  // Lyrics debounced search
  useEffect(() => {
    if (mode !== "lyrics") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (lyricsQuery.length < 3) {
      setLyricsResults([]);
      return;
    }
    setLyricsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lyrics-search?q=${encodeURIComponent(lyricsQuery)}`);
        const data = await res.json();
        setLyricsResults(data.tracks || []);
      } catch {
        setLyricsResults([]);
      } finally {
        setLyricsLoading(false);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [lyricsQuery, mode]);

  // Auto-focus lyrics input
  useEffect(() => {
    if (mode === "lyrics" && lyricsInputRef.current) {
      lyricsInputRef.current.focus();
    }
  }, [mode]);

  // Quick-add handler
  const handleQuickAdd = async () => {
    if (!result?.title || !result?.artist) return;
    setQuickAddLoading(true);
    try {
      const res = await fetch("/api/tracks/quick-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          artist: result.artist,
          country: quickAddCountry || undefined,
          genre: quickAddGenre || undefined,
        }),
      });
      if (res.ok) setQuickAddDone(true);
    } catch (err) {
      console.error("Quick add error:", err);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const modes: { key: Mode; label: string; icon: typeof Ear }[] = [
    { key: "listen", label: "Listen", icon: Ear },
    { key: "hum", label: "Hum / Sing", icon: Music2 },
    { key: "lyrics", label: "Lyrics", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Mode tabs */}
      <div className="flex justify-center gap-6 pt-6 pb-4 border-b border-white/10">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); resetState(); }}
              className={"flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors " +
                (active
                  ? "text-white border-b-2"
                  : "text-gray-500 hover:text-gray-300")}
              style={active ? { borderColor: "#F4A500" } : {}}
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* ══════ HUM MODE ══════ */}
        {mode === "hum" && (
          <>
            {state !== "matched" && (
              <div className="relative mb-8">
                {state === "listening" && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: "#E25B00", animationDuration: "1.5s" }} />
                    <div className="absolute -inset-4 rounded-full animate-pulse opacity-10" style={{ backgroundColor: "#E25B00" }} />
                  </>
                )}
                <button
                  onClick={state === "idle" || state === "no_match" || state === "permission_denied" ? startHumming : undefined}
                  disabled={state === "processing" || state === "listening"}
                  className="relative flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: "160px", height: "160px",
                    backgroundColor: state === "listening" ? "#E25B00" : state === "processing" ? "#374151" : "#F4A500",
                    cursor: state === "processing" || state === "listening" ? "default" : "pointer",
                  }}
                >
                  {state === "processing" ? (
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  ) : state === "listening" ? (
                    <AudioLines className="h-10 w-10 text-white animate-pulse" />
                  ) : (
                    <Music2 className="h-10 w-10 text-white" />
                  )}
                </button>
              </div>
            )}

            <div className="text-center">
              {state === "idle" && (
                <>
                  <p className="text-white text-lg font-medium">Hum or sing your melody</p>
                  <p className="text-white/50 text-sm mt-1">Hold the button and hum for 10–15 seconds</p>
                </>
              )}
              {state === "listening" && (
                <>
                  <p className="text-white text-lg font-medium">Keep humming...</p>
                  <p className="text-white/50 text-sm mt-1">{countdown} seconds...</p>
                </>
              )}
              {state === "processing" && (
                <p className="text-white text-lg font-medium">Matching your melody...</p>
              )}
              {state === "permission_denied" && (
                <div className="space-y-3">
                  <p className="text-white text-lg font-medium">Microphone access needed</p>
                  <p className="text-white/50 text-sm">Allow microphone access in your browser settings</p>
                  <button onClick={startHumming} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>Try again</button>
                </div>
              )}
              {state === "no_match" && (
                <div className="space-y-3">
                  <p className="text-white text-lg font-medium">Couldn&apos;t match that melody</p>
                  <p className="text-white/50 text-sm">Try humming more clearly or for longer</p>
                  <div className="flex gap-3 mt-4 justify-center">
                    <button onClick={resetState} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>Try again</button>
                    <button onClick={() => { setMode("lyrics"); resetState(); }} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15">Try lyrics instead →</button>
                  </div>
                </div>
              )}
              {state === "matched" && result?.found && <MatchCard result={result} onReset={resetState} showQuickAdd={showQuickAdd} setShowQuickAdd={setShowQuickAdd} quickAddCity={quickAddCity} setQuickAddCity={setQuickAddCity} quickAddCountry={quickAddCountry} setQuickAddCountry={setQuickAddCountry} quickAddGenre={quickAddGenre} setQuickAddGenre={setQuickAddGenre} quickAddLoading={quickAddLoading} quickAddDone={quickAddDone} handleQuickAdd={handleQuickAdd} />}
            </div>
          </>
        )}

        {/* ══════ LYRICS MODE ══════ */}
        {mode === "lyrics" && (
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                ref={lyricsInputRef}
                type="text"
                value={lyricsQuery}
                onChange={(e) => setLyricsQuery(e.target.value)}
                placeholder="Type a few words you remember..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-[#F4A500]/50 focus:ring-1 focus:ring-[#F4A500]/30"
                style={{ minHeight: "56px" }}
              />
            </div>

            {lyricsQuery.length > 0 && lyricsQuery.length < 3 && (
              <p className="text-center text-white/40 text-sm">Keep typing...</p>
            )}

            {lyricsLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!lyricsLoading && lyricsQuery.length >= 3 && lyricsResults.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <p className="text-white/60">No tracks found for that lyric</p>
                <p className="text-white/40 text-sm">Maybe it&apos;s not on JamFind yet</p>
                <Link href="/submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium mt-2" style={{ backgroundColor: "#F4A500", color: "#000" }}>
                  + Submit this track
                </Link>
              </div>
            )}

            {!lyricsLoading && lyricsResults.length > 0 && (
              <div className="space-y-1 flex-1 overflow-y-auto pb-20">
                {lyricsResults.map((t) => (
                  <Link key={t.id} href={`/track/${t.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-colors group">
                    {t.artworkUrl ? (
                      <Image src={t.artworkUrl} alt={t.title} width={48} height={48} className="rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"><Music2 className="h-5 w-5 text-white/30" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{t.title}</p>
                      <p className="text-white/50 text-xs truncate">
                        {t.artist}
                        {t.country && <span style={{ color: "#14b8a6" }}> · {t.country}</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.genre && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{t.genre}</span>
                        )}
                        {t.favoriteCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-white/40"><Heart className="h-2.5 w-2.5" /> {t.favoriteCount}</span>
                        )}
                      </div>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#F4A500] transition-colors" style={{ minWidth: "40px", minHeight: "40px" }}>
                      <Play className="h-4 w-4 text-white ml-0.5" />
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ LISTEN MODE ══════ */}
        {mode === "listen" && (
          <>
            {/* Circular button */}
            {state !== "matched" && (
              <div className="relative mb-8">
                {/* Pulse ring when listening */}
                {state === "listening" && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: "#E25B00", animationDuration: "1.5s" }} />
                    <div className="absolute -inset-4 rounded-full animate-pulse opacity-10" style={{ backgroundColor: "#E25B00" }} />
                  </>
                )}

                <button
                  onClick={state === "idle" || state === "no_match" || state === "permission_denied" ? startListening : undefined}
                  disabled={state === "processing" || state === "listening"}
                  className="relative flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundColor:
                      state === "listening" ? "#E25B00"
                      : state === "processing" ? "#374151"
                      : "#F4A500",
                    cursor: state === "processing" || state === "listening" ? "default" : "pointer",
                  }}
                >
                  {state === "processing" ? (
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  ) : (
                    <Mic className="h-10 w-10 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Status text */}
            <div className="text-center">
              {state === "idle" && (
                <>
                  <p className="text-white text-lg font-medium">Tap to identify a song</p>
                  <p className="text-white/50 text-sm mt-1">Hold your phone near the music</p>
                </>
              )}

              {state === "listening" && (
                <>
                  <p className="text-white text-lg font-medium">Listening...</p>
                  <p className="text-white/50 text-sm mt-1">{countdown} seconds...</p>
                </>
              )}

              {state === "processing" && (
                <p className="text-white text-lg font-medium">Finding your track...</p>
              )}

              {state === "permission_denied" && (
                <div className="space-y-3">
                  <p className="text-white text-lg font-medium">Microphone access needed</p>
                  <p className="text-white/50 text-sm">Allow microphone access in your browser settings and try again</p>
                  <button
                    onClick={startListening}
                    className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#F4A500", color: "#000" }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {state === "no_match" && (
                <div className="space-y-3">
                  <p className="text-white text-lg font-medium">Nothing found</p>
                  <p className="text-white/50 text-sm">Try getting closer to the speaker</p>
                  <div className="flex gap-3 mt-4 justify-center">
                    <button
                      onClick={resetState}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: "#F4A500", color: "#000" }}
                    >
                      Try again
                    </button>
                    <Link
                      href="/submit"
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15"
                    >
                      Submit manually
                    </Link>
                  </div>
                </div>
              )}

              {/* Match result card */}
              {state === "matched" && result?.found && <MatchCard result={result} onReset={resetState} showQuickAdd={showQuickAdd} setShowQuickAdd={setShowQuickAdd} quickAddCity={quickAddCity} setQuickAddCity={setQuickAddCity} quickAddCountry={quickAddCountry} setQuickAddCountry={setQuickAddCountry} quickAddGenre={quickAddGenre} setQuickAddGenre={setQuickAddGenre} quickAddLoading={quickAddLoading} quickAddDone={quickAddDone} handleQuickAdd={handleQuickAdd} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════ SHARED MATCH CARD ══════ */
function MatchCard({
  result, onReset, showQuickAdd, setShowQuickAdd,
  quickAddCity, setQuickAddCity, quickAddCountry, setQuickAddCountry,
  quickAddGenre, setQuickAddGenre, quickAddLoading, quickAddDone, handleQuickAdd,
}: {
  result: MatchResult;
  onReset: () => void;
  showQuickAdd: boolean; setShowQuickAdd: (v: boolean) => void;
  quickAddCity: string; setQuickAddCity: (v: string) => void;
  quickAddCountry: string; setQuickAddCountry: (v: string) => void;
  quickAddGenre: string; setQuickAddGenre: (v: string) => void;
  quickAddLoading: boolean; quickAddDone: boolean; handleQuickAdd: () => void;
}) {
  const countries = ["Ghana","Nigeria","South Africa","Kenya","Tanzania","Uganda","Senegal","Cameroon","Ivory Coast","Other"];
  const genres = ["Afrobeat","Amapiano","Highlife","Afropop","Drill","Hip-Hop","R&B","Dancehall","Gospel","Reggae","Pop","Other"];

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
        <div className="flex gap-4 items-start">
          {result.track?.artworkUrl ? (
            <Image src={result.track.artworkUrl} alt={result.title || ""} width={64} height={64} className="rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
              <Music2 className="h-6 w-6 text-white/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg truncate">{result.title}</h3>
            <p className="text-white/70 text-sm truncate">{result.artist}</p>
            {result.album && <p className="text-white/50 text-xs mt-0.5 truncate">{result.album}</p>}
            {result.genre && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(244,165,0,0.15)", color: "#F4A500" }}>
                {result.genre}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
          {result.inCatalog && result.track ? (
            <>
              <Link href={"/track/" + result.track.id} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>
                <Play className="h-4 w-4" /> Play Now
              </Link>
              <Link href="/submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15">
                + Add to my 10
              </Link>
            </>
          ) : !showQuickAdd && !quickAddDone ? (
            <>
              <p className="text-center text-white/50 text-sm py-1">Not on JamFind yet — be the first to add it</p>
              <button onClick={() => setShowQuickAdd(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F4A500", color: "#000" }}>
                + Add to JamFind
              </button>
            </>
          ) : quickAddDone ? (
            <div className="text-center space-y-2 py-2">
              <p className="text-green-400 font-medium text-sm">Added!</p>
              <Link href="/submit" className="text-sm underline" style={{ color: "#F4A500" }}>
                Now add it to your playlist →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Quick add to JamFind</p>
              <input
                value={quickAddCity}
                onChange={(e) => setQuickAddCity(e.target.value)}
                placeholder="Origin city (optional)"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#F4A500]/50"
              />
              <select
                value={quickAddCountry}
                onChange={(e) => setQuickAddCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F4A500]/50"
              >
                <option value="">Country</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={quickAddGenre}
                onChange={(e) => setQuickAddGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F4A500]/50"
              >
                <option value="">Genre</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <button
                onClick={handleQuickAdd}
                disabled={quickAddLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#F4A500", color: "#000" }}
              >
                {quickAddLoading ? "Adding..." : "Add to JamFind"}
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onReset} className="mt-4 text-sm text-white/50 hover:text-white/70 transition-colors">
        Identify another song
      </button>
    </div>
  );
}
