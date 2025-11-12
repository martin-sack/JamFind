"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import SearchResults from "components/discover/SearchResults";

export default function StreamHub() {
  const [q, setQ] = useState("");
  const [searchMode, setSearchMode] = useState<"local">("local");
  
  const [recent] = useState([
    {
      id: '1',
      title: 'Last Last',
      artistName: 'Burna Boy',
    },
    {
      id: '2',
      title: 'Calm Down',
      artistName: 'Rema ft. Selena Gomez',
    },
    {
      id: '3',
      title: 'Essence',
      artistName: 'Wizkid ft. Tems',
    },
    {
      id: '4',
      title: 'Love Nwantiti',
      artistName: 'CKay',
    },
    {
      id: '5',
      title: 'Peru',
      artistName: 'Fireboy DML',
    },
    {
      id: '6',
      title: 'Soweto',
      artistName: 'Victony ft. Tempoe',
    },
    {
      id: '7',
      title: 'Bandana',
      artistName: 'Fireboy DML ft. Asake',
    },
    {
      id: '8',
      title: 'Rush',
      artistName: 'Ayra Starr',
    },
    {
      id: '9',
      title: 'Terminator',
      artistName: 'Asake',
    },
    {
      id: '10',
      title: 'People',
      artistName: 'Libianca',
    }
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the SearchResults component
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      {/* Hero Section */}
      <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-[#8b5cf6]/30 via-[#ec4899]/30 to-[#14b8a6]/20 border border-white/10 shadow-lg shadow-black/20">
        <h1 className="text-4xl font-game-title mb-2">Stream Hub</h1>
        <p className="text-white/70 text-lg">
          Search and discover music on JamFind.
        </p>
      </div>

      {/* Search Area */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-xl font-game-title mb-2">Search JamFind</h2>
          <p className="text-white/70 text-sm">
            Search the JamFind music catalog
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search JamFind catalog…"
              className="flex-1 rounded-xl bg-white/5 px-4 py-3 outline-none border border-white/10 text-white placeholder-white/50 focus:border-[#8b5cf6] transition"
            />
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-medium hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Local search results or trending */}
        {q ? (
          <SearchResults q={q} />
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-game-title mb-4">Trending Now</h3>
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-sm text-white/70">Top tracks this week</div>
              <ul>
                {recent.slice(0,10).map((t:any, i:number)=>(
                  <li key={t.id} className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10" />
                      <div>
                        <div className="text-sm">{t.title}</div>
                        <div className="text-xs text-white/60">{t.artistName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/track/${t.id}`} className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Play</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {!q && (
        <div className="text-sm text-white/60">
          Looking for more? Try <Link href="/discover" className="underline">Discover</Link> for music news and updates.
        </div>
      )}
    </div>
  );
}
