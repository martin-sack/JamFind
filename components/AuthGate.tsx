"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  if (status === "loading") return <div className="p-6 text-white/70">Checking…</div>;
  if (!data?.user) {
    return (
      <div className="p-6 text-white/80">
        Please <Link href="/login" className="underline">sign in</Link> to continue.
      </div>
    );
  }
  return <>{children}</>;
}
