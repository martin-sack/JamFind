"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlaylistPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const r = await fetch("/api/playlists/create", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ title, description: desc, isPublic })});
    setLoading(false);
    if (!r.ok) return alert("Error creating playlist");
    const j = await r.json(); router.push(`/playlists/${j.id}`);
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="h1 mb-4">New Playlist</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" />
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} /> Public</label>
        <button disabled={!title || loading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">{loading ? "Creating…" : "Create"}</button>
      </form>
    </div>
  );
}
