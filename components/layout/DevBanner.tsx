export function DevBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#14b8a6] py-2">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-blue-100 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-200"></span>
            </span>
            <span className="hidden sm:inline">🚧</span>
            <span className="font-semibold">Platform Under Development</span>
          </span>
          <span className="hidden md:inline text-blue-200/80">•</span>
          <span className="hidden md:inline text-blue-200/90">Updates & changes coming soon</span>
        </div>
      </div>
    </div>
  );
}
