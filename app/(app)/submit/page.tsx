"use client";
import { useEffect, useState } from "react";
import AuthGate from 'components/AuthGate';
import Modal from 'components/ui/Modal';
import Link from "next/link";
import { CATS, catLabel, catEmoji, CatKey } from "lib/submit-categories";

// Simple replacements for removed components
function Card({ children, className = "", onClick, hoverable, glow }: any) {
  return (
    <div 
      className={`rounded-xl border border-white/10 bg-white/5 ${hoverable ? 'hover:bg-white/10 transition' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Section({ title, action, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ title, subtitle, icon }: any) {
  return (
    <div className="text-center py-8 text-white/60">
      <div className="text-4xl mb-2">🎵</div>
      <div className="font-medium mb-1">{title}</div>
      <div className="text-sm">{subtitle}</div>
    </div>
  );
}

function formatWeekRange(weekStartISO: string | Date) {
  const d = new Date(weekStartISO);
  const end = new Date(d); end.setDate(d.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit" };
  return `${d.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function StatusBadge({ s }: { s: string }) {
  const map:any = { submitted: "✅ Submitted", draft: "🕐 Draft" };
  return <span className="text-xs px-2 py-1 rounded bg-white/10">{map[s] ?? s}</span>;
}

export default function SubmitYourTen() {
  const [cat, setCat] = useState<CatKey | null>(null);
  const [submissionId, setSubmissionId] = useState<string| null>(null);
  const [list, setList] = useState<any[]>([]);
  const [importUrl, setImportUrl] = useState("");
  const [history, setHistory] = useState<any[] | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<any | null>(null);
  const canAdd = list.length < 10;

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/submit/history", { cache: "no-store" });
      if (r.ok) setHistory(await r.json());
      else setHistory([]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!viewId) { setViewData(null); return; }
      const r = await fetch(`/api/submit/details/${viewId}`, { cache: "no-store" });
      if (r.ok) setViewData(await r.json());
    })();
  }, [viewId]);

  async function ensureDraft(category: CatKey) {
    const r = await fetch("/api/submit/ensure-draft", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ category })});
    const j = await r.json();
    setSubmissionId(j.submissionId);
  }

  function reset() { setList([]); setSubmissionId(null); }

  async function importPlaylist() {
    if (!importUrl) return;
    const r = await fetch("/api/submit/import", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ url: importUrl })});
    const j = await r.json();
    if (j.error) { alert(j.error); return; }
    if (!submissionId) return;
    const toAdd = (j.items ?? []).slice(0, Math.max(0, 10 - list.length));
    if (!toAdd.length) return;
    await fetch("/api/submit/tracks", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ submissionId, items: toAdd })});
    setList(prev => [...prev, ...toAdd.map((t:any, i:number)=>({ ...t, id: `${Date.now()}_${i}` }))]);
    setImportUrl("");
  }

  async function addManualTrack(title:string, artist:string) {
    if (!submissionId || !canAdd) return;
    const item = { title, artist, artworkUrl: null, source: "manual", sourceId: null };
    await fetch("/api/submit/tracks", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ submissionId, items: [item] })});
    setList(prev => [...prev, { ...item, id: `${Date.now()}`}]);
  }

  async function removeTrack(localId:string) {
    // If you store real ids from API response, call DELETE; here we only clean the UI for MVP
    setList(prev => prev.filter(x => x.id !== localId));
  }

  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Neon header strip */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#14b8a6]">
          <div className="rounded-3xl bg-[#0a0b10]/80 px-6 py-5">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Submit Your 10 Tracks</h1>
            <p className="text-white/60 text-sm">Compete weekly to climb the charts and earn XP</p>
          </div>
        </div>

        {!cat ? (
          <div className="space-y-8">
            {/* Category Selection */}
            <Section
              title="Choose your category for this week"
            >
              <div className="grid md:grid-cols-3 gap-4">
                {CATS.map(c => (
                  <Card key={c.key} glow="purple" hoverable className="p-4 cursor-pointer" onClick={async()=>{ setCat(c.key); await ensureDraft(c.key); }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{c.emoji}</span>
                      <div className="text-sm font-semibold">{c.label}</div>
                    </div>
                    <div className="text-xs text-white/60">{c.hint}</div>
                  </Card>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/50">You can submit one playlist per category per week (max 10 tracks).</p>
            </Section>

            {/* History Section */}
            {history && (
              <Section
                title="Your Previous Submissions"
                action={<span className="text-xs text-white/60">{history.length} total</span>}
              >
                {history.length === 0 ? (
                  <EmptyState title="No previous submissions yet." subtitle="Start building your first weekly playlist!" icon="music" />
                ) : (
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="text-xs text-white/60 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left w-40">Week</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-right w-32">Tracks</th>
                          <th className="px-4 py-3 text-left w-32">Status</th>
                          <th className="px-4 py-3 text-right w-48">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(row => (
                          <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.04] transition">
                            <td className="px-4 py-3 text-sm">{formatWeekRange(row.weekStart)}</td>
                            <td className="px-4 py-3 text-sm">{catEmoji(row.category)} {catLabel(row.category)}</td>
                            <td className="px-4 py-3 text-sm text-right">{row.trackCount}</td>
                            <td className="px-4 py-3"><StatusBadge s={row.status} /></td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={()=>setViewId(row.id)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 mr-2 text-sm">View</button>
                              <button onClick={async()=>{
                                const r = await fetch("/api/submit/copy", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ sourceSubmissionId: row.id })});
                                if (r.ok) {
                                  const j = await r.json();
                                  alert("Copied to this week. Open the builder to edit.");
                                }
                              }} className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-sm">Copy to This Week</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="text-white/80">Category: <span className="px-2 py-1 rounded-md bg-white/10">{catLabel(cat)}</span></div>
              <button className="text-sm underline text-white/60" onClick={()=>{ setCat(null); reset(); }}>Change category</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: current list */}
              <Section
                title={`Your 10 Tracks (${list.length}/10)`}
                action={<span className="text-xs text-white/60">Week of {new Date().toLocaleDateString()}</span>}
              >
                {list.length === 0 ? (
                  <EmptyState title="No tracks added yet." subtitle="Import or manually add tracks to build your weekly playlist." icon="music" />
                ) : (
                  <div className="space-y-2">
                    {list.map((t:any, i:number)=>(
                      <Card key={t.id} hoverable={false} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6]/60 to-[#ec4899]/60 flex items-center justify-center text-white font-bold text-sm">
                              {i+1}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{t.title}</div>
                              <div className="text-xs text-white/60">{t.artist}</div>
                            </div>
                          </div>
                          <button onClick={()=>removeTrack(t.id)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs">Remove</button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Section>

              {/* Right: add/import */}
              <Section
                title="Add Tracks"
              >
                {/* Import by link */}
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/60 mb-2">Import playlist by link (Spotify / Apple Music / YouTube)</div>
                    <div className="flex gap-2">
                      <input value={importUrl} onChange={e=>setImportUrl(e.target.value)} placeholder="Paste playlist link…"
                             className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50" />
                      <button disabled={!canAdd || !importUrl} onClick={importPlaylist}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] disabled:opacity-50 hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all">Import</button>
                    </div>
                    <div className="text-[11px] text-white/50 mt-1">We'll fetch up to 10 tracks.</div>
                  </div>

                  {/* Manual add (title + artist) */}
                  <ManualAdd onAdd={addManualTrack} disabled={!canAdd} />
                </div>
              </Section>
            </div>

            {/* Submit button */}
            {list.length > 0 && (
              <div className="flex justify-center pt-6">
                <button 
                  onClick={async () => {
                    if (!submissionId) return;
                    const r = await fetch("/api/submit/finalize", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ submissionId }),
                    });
                    const j = await r.json();
                    if (!r.ok) return alert(j.error || "Could not submit");
                    alert(`Submitted! ${j.fee} XP deducted. New balance: ${j.xp}`);
                    // navigate to leaderboard/charts
                    window.location.href = "/leaderboard";
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-lg font-semibold hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
                >
                  Submit Your 10 Tracks (100 XP)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for viewing submission details */}
      <Modal open={!!viewId} onClose={()=>setViewId(null)}>
        {!viewData ? (
          <div className="p-6 text-center text-white/70">Loading…</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                {catEmoji(viewData.category)} {catLabel(viewData.category)} · {formatWeekRange(viewData.weekStart)}
              </div>
              <button onClick={()=>setViewId(null)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15">Close</button>
            </div>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="text-xs text-white/60 border-b border-white/10">
                  <tr>
                    <th className="px-3 py-2 text-left w-10">#</th>
                    <th className="px-3 py-2 text-left">Track</th>
                    <th className="px-3 py-2 text-right w-24">Play</th>
                  </tr>
                </thead>
                <tbody>
                  {viewData.tracks.map((t:any, i:number)=>(
                    <tr key={t.id} className="border-b border-white/5">
                      <td className="px-3 py-2">{i+1}</td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{t.title}</div>
                        <div className="text-xs text-white/60">{t.artist}</div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {t.streamHref ? (
                          <Link href={`/track/${t.trackId}`} className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Play</Link>
                        ) : (
                          <span className="text-xs text-white/40">No stream</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </AuthGate>
  );
}

function ManualAdd({ onAdd, disabled }:{ onAdd:(t:string,a:string)=>void; disabled:boolean }) {
  const [t, setT] = useState(""); const [a, setA] = useState("");
  return (
    <div className="space-y-2">
      <div className="text-xs text-white/60">Add a single track manually</div>
      <div className="grid grid-cols-2 gap-2">
        <input value={t} onChange={e=>setT(e.target.value)} placeholder="Title" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2" />
        <input value={a} onChange={e=>setA(e.target.value)} placeholder="Artist" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2" />
      </div>
      <button disabled={disabled || !t || !a} onClick={()=>{ onAdd(t,a); setT(""); setA(""); }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50">Add track</button>
    </div>
  );
}
