"use client";
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioPlayer({ url }: { url: string }) {
  const waveformRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!waveformRef.current) return;
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#d1d5db",
      progressColor: "#f59e0b",
      url
    });
    return () => ws.destroy();
  }, [url]);
  return <div ref={waveformRef} className="w-full h-20" />;
}
