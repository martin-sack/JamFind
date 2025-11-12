"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PeopleYouMayLike() {
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/social/suggest", { cache: "no-store" });
      if (r.ok) setRows(await r.json());
      else setRows([]);
    })();
  }, []);

  if (!rows) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm text-white/70">People you may like</div>
        <Link href="/discover" className="text-xs underline">See more</Link>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-white/60">We'll show suggestions as you like songs and submit playlists.</div>
      ) : (
        <ul className="divide-y divide-white/10">
          {rows.map((u:any)=>(
            <li key={u.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : <span className="text-sm">{u.name?.[0]?.toUpperCase() ?? "U"}</span>}
                  </div>
                  <div>
                    <div className="text-sm">{u.name}</div>
                    <div className="text-xs text-white/60">{u.reason}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FollowButton userId={u.id} />
                </div>
              </div>
              {u.playlists?.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {u.playlists.map((p:any)=>(
                    <Link key={p.id} href={`/playlists/${p.id}`} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10">
                      <div className="text-sm">{p.title}</div>
                      <div className="text-xs text-white/60 flex justify-between">
                        <span>{p._count.tracks} tracks</span>
                        <span className="flex gap-2">
                          <span>❤️ {p.likes}</span>
                          <span>▶️ {p.plays}</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/social/follow/toggle", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ userId }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) setFollowing(j.following);
  }

  return (
    <button onClick={toggle} disabled={busy}
      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm disabled:opacity-50">
      {following ? "Following" : "Follow"}
    </button>
  );
}
