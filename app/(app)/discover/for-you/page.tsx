"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ForYou() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch("/api/recommend/me")
      .then(r => r.json())
      .then(data => {
        setRecs(data.recs || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load recommendations:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold mb-6">Discover For You</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-900 p-4 rounded-xl animate-pulse">
              <div className="bg-neutral-700 h-48 rounded-lg mb-4"></div>
              <div className="bg-neutral-700 h-6 rounded mb-2"></div>
              <div className="bg-neutral-700 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Discover For You</h1>
      
      {recs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-400 mb-4">No recommendations yet</h2>
          <p className="text-gray-500">
            Start listening to tracks to get personalized recommendations based on your taste!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map(track => (
            <div key={track.id} className="bg-neutral-900 p-4 rounded-xl text-white hover:bg-neutral-800 transition-colors">
              <div className="relative aspect-square mb-4">
                <Image 
                  src={track.artworkUrl || "/placeholder.jpg"} 
                  alt={track.title}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <h2 className="text-xl font-medium truncate">{track.title}</h2>
              <p className="text-sm text-gray-400 truncate">
                {track.artist?.name || "Unknown Artist"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {track.genres && track.genres !== "Unknown" && (
                  <span className="px-2 py-1 bg-blue-500 text-xs rounded-full">
                    {track.genres}
                  </span>
                )}
                {track.moods && track.moods !== "Unknown" && (
                  <span className="px-2 py-1 bg-purple-500 text-xs rounded-full">
                    {track.moods}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
