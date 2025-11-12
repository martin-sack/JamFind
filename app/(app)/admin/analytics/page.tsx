"use client";
import { useOverview } from "hooks/useAnalytics";
import TopTracksChart from "components/Charts/TopTracksChart";

export default function AdminAnalytics() {
  const { data } = useOverview();
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">JamFind Analytics</h1>
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-800 p-4 rounded-xl text-white">
            <p className="text-sm uppercase text-gray-400">Users</p>
            <p className="text-2xl font-bold">{data.totalUsers}</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl text-white">
            <p className="text-sm uppercase text-gray-400">Streams</p>
            <p className="text-2xl font-bold">{data.totalStreams}</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl text-white">
            <p className="text-sm uppercase text-gray-400">Tracks</p>
            <p className="text-2xl font-bold">{data.totalTracks}</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl text-white">
            <p className="text-sm uppercase text-gray-400">Tips (¢)</p>
            <p className="text-2xl font-bold">{data.totalTipAmount}</p>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-2">Top Tracks (Weekly)</h2>
        <TopTracksChart />
      </div>
    </div>
  );
}
