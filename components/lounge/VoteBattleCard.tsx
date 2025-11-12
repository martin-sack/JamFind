"use client";
import { useState } from "react";

export default function VoteBattleCard({ left, right, leftPct }: any) {
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVote = async (energy: number, teamId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/battles/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId: "mock-battle-1",
          teamId: teamId,
          energy: energy
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        // Show success message
        alert(result.message);
        // Refresh the page to update energy display
        window.location.reload();
      } else {
        alert(result.error || "Vote failed");
      }
    } catch (error) {
      alert("Vote failed - please try again");
    } finally {
      setLoading(false);
      setVoting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">🎵</div>
          <div className="text-sm">
            <div className="font-semibold">{left}</div>
            <div className="text-xs text-white/60">vs</div>
          </div>
        </div>
        <button
          onClick={() => setVoting(true)}
          disabled={loading}
          className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 disabled:opacity-50"
        >
          {loading ? "..." : "Vote"}
        </button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{right}</div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">🎵</div>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${leftPct}%` }} />
      </div>
      {voting && (
        <div className="mt-3 flex items-center gap-2">
          <button 
            onClick={() => handleVote(10, left)}
            disabled={loading}
            className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            +10 Energy
          </button>
          <button 
            onClick={() => handleVote(50, left)}
            disabled={loading}
            className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            +50 Energy
          </button>
          <button 
            onClick={() => handleVote(100, left)}
            disabled={loading}
            className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            +100 Energy
          </button>
        </div>
      )}
    </div>
  );
}
