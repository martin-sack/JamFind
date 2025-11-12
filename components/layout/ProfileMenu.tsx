"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

function useOutside(ref: React.RefObject<HTMLElement>, onClose: ()=>void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export function ProfileMenu() {
  const { data } = useSession();
  const user = data?.user as any;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));

  if (!user) return <Link href="/login" className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Sign in</Link>;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
        {user.name?.[0]?.toUpperCase() ?? "U"}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-black/80 backdrop-blur p-2 z-50">
          <div className="px-3 py-2 text-sm text-white/70">Signed in as <span className="text-white">{user.email}</span></div>
          <div className="h-px bg-white/10 my-2" />
          <Link href="/account" className="block px-3 py-2 rounded-lg hover:bg-white/10">Profile</Link>
          <Link href="/account/settings" className="block px-3 py-2 rounded-lg hover:bg-white/10">Settings</Link>
          <Link href="/account/verify" className="block px-3 py-2 rounded-lg hover:bg-white/10">Verification</Link>
          <div className="h-px bg-white/10 my-2" />
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10">Sign out</button>
        </div>
      )}
    </div>
  );
}
