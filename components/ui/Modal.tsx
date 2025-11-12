"use client";
import { useEffect } from "react";

export default function Modal({ open, onClose, children }:{
  open: boolean; onClose: ()=>void; children: React.ReactNode;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent){ if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c0c10]/95 backdrop-blur p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
