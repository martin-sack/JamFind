"use client";
export default function FriendsBar() {
  const friends = [
    { id:1, name:"DJ Kuda", online:true },
    { id:2, name:"BeachBum", online:false },
    { id:3, name:"SnowQueen", online:true },
  ];
  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      {friends.map(f => (
        <button key={f.id} className="flex items-center gap-2 rounded-full px-3 py-2 bg-white/8 border border-white/10">
          <div className={`w-6 h-6 rounded-full ${f.online?"bg-emerald-400":"bg-white/30"}`} />
          <span className="text-xs">{f.name}</span>
        </button>
      ))}
    </div>
  );
}
