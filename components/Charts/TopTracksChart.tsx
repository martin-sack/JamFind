"use client";
import { useTopTracks } from "hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TopTracksChart() {
  const { data } = useTopTracks();
  if (!data?.topTracks) return <p>Loading...</p>;
  
  // For now, use track IDs as labels since we don't have track titles in the analytics data
  // In a real implementation, you would fetch track details or modify the analytics endpoint
  // to include track titles in the response
  const chartData = data.topTracks.map((t:any)=>({ 
    name: t.trackId.slice(0,6), 
    plays: parseInt(t.plays) 
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="plays" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
