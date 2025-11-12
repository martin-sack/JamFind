"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data } = useSession();
  const user = data?.user as any;

  return (
    <header className="w-full bg-black/40 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        {/* Left: brand + main links */}
        <nav className="flex items-center gap-3">
          <Link href="/" className="font-bold">JamFind</Link>
          <Link href="/discover">Discover</Link>
          <Link href="/charts">Billboard</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/stream">Stream</Link>
        </nav>

        {/* Right: auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-white/80 hidden sm:inline">Hi, {user.name || user.email}</span>
              <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15" onClick={()=>signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </>
          ) : (
            <Link className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white" href="/login">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
