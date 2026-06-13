"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Ear, Music2, FileText, Loader2 } from "lucide-react";
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

      const res = await fetch("/api/identify", {
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
    setCountdown(10);
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
        {/* Hum / Lyrics placeholder */}
        {mode !== "listen" && (
          <div className="text-center">
            <p className="text-white/60 text-lg">Coming soon</p>
            <p className="text-white/40 text-sm mt-2">
              {mode === "hum" ? "Hum or sing a melody to find it" : "Search by lyrics"}
            </p>
          </div>
        )}

        {/* Listen mode */}
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
              {state === "matched" && result?.found && (
                <div className="w-full max-w-sm mx-auto animate-fade-in-up">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                    <div className="flex gap-4 items-start">
                      {result.track?.artworkUrl ? (
                        <Image
                          src={result.track.artworkUrl}
                          alt={result.title || ""}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                          <Music2 className="h-6 w-6 text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">{result.title}</h3>
                        <p className="text-white/70 text-sm truncate">{result.artist}</p>
                        {result.album && (
                          <p className="text-white/50 text-xs mt-0.5 truncate">{result.album}</p>
                        )}
                        {result.genre && (
                          <span
                            className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: "rgba(244,165,0,0.15)", color: "#F4A500" }}
                          >
                            {result.genre}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
                      {result.inCatalog && result.track ? (
                        <>
                          <Link
                            href={'/track/' + result.track.id}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                            style={{ backgroundColor: "#F4A500", color: "#000" }}
                          >
                            Play Now
                          </Link>
                          <Link
                            href="/submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15"
                          >
                            + Add to my 10
                          </Link>
                        </>
                      ) : (
                        <>
                          <p className="text-center text-white/50 text-sm py-1">
                            Not on JamFind yet — be the first to add it
                          </p>
                          <Link
                            href="/submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                            style={{ backgroundColor: "#F4A500", color: "#000" }}
                          >
                            + Add to JamFind
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={resetState}
                    className="mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Identify another song
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
