"use client";
import { useState } from "react";

export function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing?: boolean }) {
  const [following, setFollowing] = useState(!!initialFollowing);
  async function toggle() {
    const r = await fetch("/api/social/follow/toggle", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ userId }) });
    const j = await r.json();
    if (r.ok) setFollowing(j.following);
  }
  return (
    <button onClick={toggle} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
      {following ? "Following" : "Follow"}
    </button>
  );
}
