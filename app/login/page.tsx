"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("tester@jamfind.dev");
  const [password, setPassword] = useState("jamfind123");
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams(); const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push(sp.get("callbackUrl") || "/");
    else alert("Invalid email or password");
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="h2 mb-4">Sign in</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                 value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                 value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
          <button disabled={loading}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-4 text-xs text-white/60">
          Demo: <b>tester@jamfind.dev / jamfind123</b> or <b>guest@jamfind.dev / guest123</b>
        </div>
      </div>
    </div>
  );
}
