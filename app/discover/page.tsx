export default function DiscoverPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JamFind — Discover</h1>
        <p className="text-white/70 text-lg">
          Discover new music and artists on JamFind.
        </p>
      </div>
      
      <div className="card p-6 text-center text-white/60">
        <p>Music discovery features coming soon!</p>
        <p className="text-sm mt-2">Check out the <a href="/stream" className="underline">Stream Hub</a> to search for music.</p>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Supported Platforms</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Audiomack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>SoundCloud</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Jamendo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Audius</span>
          </div>
        </div>
      </div>
    </main>
  );
}