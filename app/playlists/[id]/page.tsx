import Link from "next/link";

async function fetchPlaylist(id: string) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/playlists/mine`, { cache: "no-store" });
  if (!r.ok) return null;
  const all = await r.json();
  return all.find((p:any)=>p.id === id) ?? null;
}

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const p = await fetchPlaylist(params.id);
  if (!p) return <div className="py-10 text-center">Playlist not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h1">{p.title}</h1>
          <div className="text-white/60 text-sm">{p.tracks.length} tracks</div>
        </div>
        <Link href="/discover" className="text-sm underline">Find songs</Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-0 overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-white/60 border-b border-white/10">
            <tr><th className="px-4 py-2 text-left">Track</th><th className="px-4 py-2 text-right w-24">Play</th></tr>
          </thead>
        <tbody>
          {p.tracks.map((t:any)=>(
            <tr key={t.id} className="border-b border-white/5">
              <td className="px-4 py-3">
                <div className="text-sm">{t.title}</div>
                <div className="text-xs text-white/60">{t.artist}</div>
              </td>
              <td className="px-4 py-3 text-right">
                {t.trackId ? <Link href={`/track/${t.trackId}`} className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Play</Link> : <span className="text-xs text-white/40">No stream</span>}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
