import Link from "next/link";
import { prisma } from "lib/db";
import { authOptions } from "lib/auth";
import { getServerSession } from "next-auth";

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

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-3">
      <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-3 bg-white/10 rounded w-1/2"></div>
      </div>
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

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // not signed-in: bounce to marketing or show a link to sign in
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h1 className="h1 mb-2">Welcome to JamFind</h1>
        <p className="text-white/70 mb-6">Sign in to see your personalized home.</p>
        <Link href="/login" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Sign in</Link>
      </div>
    );
  }

  // Get basic user data
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true, name: true, xp: true,
      userPlaylists: { include: { tracks: true }, take: 6, orderBy: { updatedAt: "desc" } },
      following: { take: 8, orderBy: { createdAt: "desc" } }
    }
  });

  // Get liked tracks
  const likes = await prisma.trackLike.findMany({
    where: { userId: me?.id },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  
  // Get track details for liked tracks
  const likedTrackIds = likes.map(like => like.trackId);
  const likedTracks = likedTrackIds.length > 0 ? await prisma.track.findMany({
    where: { id: { in: likedTrackIds } },
    take: 10
  }) : [];

  // Get weekly submissions
  const submissions = await prisma.weeklySubmission.findMany({
    where: { userId: me?.id },
    take: 6,
    orderBy: { weekStart: "desc" },
    include: { tracks: true }
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-6">
      <div className="space-y-6">
        {/* Neon header strip */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#14b8a6]">
          <div className="rounded-3xl bg-[#0a0b10]/80 px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back{me?.name ? `, ${me.name}` : ""} 👋</h1>
              <p className="text-white/60 text-sm">Your music world at a glance.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-white/10 text-xs">XP {me?.xp ?? 0}</div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {(me?.name?.[0] ?? "U").toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Liked Tracks */}
        <Section
          title="Your liked tracks"
          action={<Link href="/likes" className="text-xs underline">See all</Link>}
        >
          {likedTracks.length === 0 ? (
            <EmptyState title="No likes yet." subtitle="Like tracks across JamFind to see them here." icon="heart" />
          ) : (
            <div className="space-y-2">
              {likedTracks.map((t:any)=> (
                <div key={t.id} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
                  <div className="text-sm">{t.title}</div>
                  <div className="text-xs text-white/60">{t.artistName || 'Unknown Artist'}</div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Your Playlists */}
        <Section
          title="Your playlists"
          action={<Link href="/playlists/new" className="text-xs underline">Create</Link>}
        >
          {(!me?.userPlaylists?.length) ? (
            <EmptyState title="No playlists yet." subtitle="Build your first playlist or import from Spotify/Apple." icon="list" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {me.userPlaylists.map((p:any)=>(
                <Link key={p.id} href={`/playlists/${p.id}`} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 hover:bg-white/10">
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-white/60">{p.tracks.length} tracks</div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Weekly submissions */}
        <Section
          title="Your weekly submissions"
          action={<Link href="/submit" className="text-xs underline">Submit this week</Link>}
        >
          {(!submissions?.length) ? (
            <EmptyState title="No submissions yet." subtitle="Compete weekly to climb the charts." icon="music" />
          ) : (
            <div className="space-y-2">
              {submissions.map((s:any)=>(
                <div key={s.id} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">{s.category}</div>
                    <div className="text-xs text-white/60">{s.tracks.length} tracks • {s.status}</div>
                  </div>
                  <Link href="/submit" className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Open</Link>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}


