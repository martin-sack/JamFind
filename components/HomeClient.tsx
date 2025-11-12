'use client'

import { Header } from '@/components/Header'
import { TrackCard, sampleTracks } from '@/components/TrackCard'
import { HorizontalSection, sectionData } from '@/components/HorizontalSection'
import { Billboard, sampleBillboardTracks } from '@/components/Billboard'
import { CountdownTimer } from '@/components/CountdownTimer'
import { GameXPBar } from '@/components/GameXPBar'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/ui/button'
import { Play, Trophy, TrendingUp, Users, Award, Star } from 'lucide-react'

export default function HomeClient() {
  // Calculate next Sunday 23:59
  const nextSunday = new Date()
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()))
  nextSunday.setHours(23, 59, 59, 999)

  return (
    <div className="min-h-screen bg-game-dark">
      {/* Hero Section - Game Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/80 via-pink-800/80 to-blue-900/80 animate-gradient-shift">
        {/* Animated Game Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-game-card border border-purple-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full neon-pulse"></div>
                    <span className="text-sm font-game-body text-neon-green">Weekly Challenge Active</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-game-title text-white leading-tight">
                    This Week's <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Music Game</span>
                  </h1>
                  
                  <p className="text-xl font-game-body text-white/80 leading-relaxed">
                    Submit Your 10 tracks and earn points. Compete with music lovers worldwide 
                    to discover the next chart-topping artists.
                  </p>
                </div>

                {/* Countdown Timer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/70 font-game-body">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span>Challenge ends in:</span>
                  </div>
                  <CountdownTimer endDate={nextSunday} />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="btn-game-primary">
                    <Play className="h-5 w-5 mr-2" />
                    Submit Your 10
                  </Button>
                  <Button size="lg" className="btn-game-secondary">
                    How to Play
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-game-title text-neon-purple">50K+</div>
                    <div className="text-sm font-game-body text-white/70">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-game-title text-neon-green">1M+</div>
                    <div className="text-sm font-game-body text-white/70">XP Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-game-title text-neon-pink">$10K</div>
                    <div className="text-sm font-game-body text-white/70">Prize Pool</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Game Dashboard Preview */}
              <div className="space-y-6">
                <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-game-heading text-white">Your Progress</h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-game-body text-white">Level 5</span>
                    </div>
                  </div>
                  <GameXPBar progress={65} currentXP={650} nextLevelXP={1000} level={5} />
                </div>

                {/* Recent Badges */}
                <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="font-game-heading text-white mb-4">Recent Badges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Badge 
                      icon="🎯" 
                      title="Sharpshooter" 
                      description="Submit 5 perfect picks"
                      rarity="rare"
                    />
                    <Badge 
                      icon="🚀" 
                      title="Rising Star" 
                      description="Reach level 5"
                      rarity="common"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Game Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Game Highlights Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-game-title text-white mb-2">🎮 Game Highlights</h2>
              <p className="font-game-body text-white/70">Top tracks earning points this week</p>
            </div>
            <Button variant="outline" className="border-neon-purple text-white hover:bg-purple-500/10">
              View All Highlights
            </Button>
          </div>

          <HorizontalSection title="Top Earning Tracks" subtitle="This week's highest XP earners">
            {sampleTracks.slice(0, 3).map((track, index) => (
              <div key={track.id} className="min-w-[280px]">
                <div className="relative">
                  {index === 0 && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-yellow-500 text-black text-xs font-game-body px-2 py-1 rounded-full flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        #1 Trending
                      </div>
                    </div>
                  )}
                  <TrackCard 
                    track={track} 
                    rank={index + 1} 
                    showRank={true}
                    showXP={true}
                    xpValue={index === 0 ? 250 : index === 1 ? 200 : 150}
                  />
                </div>
              </div>
            ))}
          </HorizontalSection>
        </section>

        {/* Last Week's Winners */}
        <section className="bg-game-card rounded-2xl p-8 border border-purple-500/30">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-game-title text-white mb-2">🏆 Last Week's Winners</h2>
              <p className="font-game-body text-white/70">Top players and artists from the previous challenge</p>
            </div>
            <Button variant="outline" className="border-neon-green text-white hover:bg-green-500/10">
              Full Results
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Players */}
            <div>
              <h3 className="font-game-heading text-white mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Top Players
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'MusicMaster42', points: 1250, avatar: '🎵' },
                  { name: 'BeatHunter', points: 980, avatar: '🥁' },
                  { name: 'RhythmRider', points: 870, avatar: '🎸' }
                ].map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className="font-game-body text-white">{player.name}</div>
                        <div className="text-xs text-muted-foreground">{player.points} XP</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
                      <span className="text-sm font-game-body text-neon-green">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div>
              <h3 className="font-game-heading text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-400" />
                Top Artists
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Burna Boy', appearances: 45, avatar: '🔥' },
                  { name: 'Tems', appearances: 38, avatar: '✨' },
                  { name: 'Wizkid', appearances: 32, avatar: '⭐' }
                ].map((artist, index) => (
                  <div key={artist.name} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{artist.avatar}</div>
                      <div>
                        <div className="font-game-body text-white">{artist.name}</div>
                        <div className="text-xs text-muted-foreground">{artist.appearances} appearances</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Star className="h-4 w-4 text-yellow-400" />}
                      <span className="text-sm font-game-body text-neon-pink">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stream to Discover */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-game-title text-white mb-2">🎧 Stream to Discover</h2>
              <p className="font-game-body text-white/70">Trending tracks to preview and add to your 10</p>
            </div>
            <Button variant="outline" className="border-neon-pink text-white hover:bg-pink-500/10">
              Browse All
            </Button>
          </div>

          <HorizontalSection title="Trending Now" subtitle="Community favorites">
            {sampleTracks.slice(3, 8).map((track) => (
              <div key={track.id} className="min-w-[200px]">
                <TrackCard track={track} showXP={true} xpValue={100} />
              </div>
            ))}
          </HorizontalSection>
        </section>

        {/* Regional Highlights */}
        <div className="space-y-12">
          <HorizontalSection 
            title={sectionData.trendingGhana.title} 
            subtitle={sectionData.trendingGhana.subtitle}
            showAllLink="/charts/ghana"
          >
            {sectionData.trendingGhana.tracks.map((track) => (
              <div key={track.id} className="min-w-[200px]">
                <TrackCard track={track} showXP={true} xpValue={80} />
              </div>
            ))}
          </HorizontalSection>

          <HorizontalSection 
            title={sectionData.trendingNigeria.title} 
            subtitle={sectionData.trendingNigeria.subtitle}
            showAllLink="/charts/nigeria"
          >
            {sectionData.trendingNigeria.tracks.map((track) => (
              <div key={track.id} className="min-w-[200px]">
                <TrackCard track={track} showXP={true} xpValue={90} />
              </div>
            ))}
          </HorizontalSection>
        </div>

        {/* Billboard Preview */}
        <section className="bg-game-card rounded-2xl p-8 border border-purple-500/30">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-game-title text-white mb-2">📈 JamFind Billboard</h2>
              <p className="font-game-body text-white/70">Top 100 tracks based on community submissions and engagement</p>
            </div>
            <Button variant="outline" className="border-neon-purple text-white hover:bg-purple-500/10">
              View Full Chart
            </Button>
          </div>
          
          <Billboard tracks={sampleBillboardTracks.slice(0, 5)} />
          
          <div className="text-center mt-8">
            <Button variant="outline" className="border-neon-green text-white hover:bg-green-500/10">
              Load More Tracks
            </Button>
          </div>
        </section>

        {/* Game Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-game-card border border-purple-500/30 card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
              <span className="text-2xl">🎮</span>
            </div>
            <h3 className="text-xl font-game-heading text-white mb-2">Weekly Challenges</h3>
            <p className="font-game-body text-muted-foreground">
              Compete in weekly music discovery games. Submit your 10 tracks and earn XP.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-game-card border border-green-500/30 card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-game-heading text-white mb-2">Leaderboards</h3>
            <p className="font-game-body text-muted-foreground">
              Climb the ranks and compete with players worldwide for exclusive rewards.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-game-card border border-pink-500/30 card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="text-xl font-game-heading text-white mb-2">Exclusive Rewards</h3>
            <p className="font-game-body text-muted-foreground">
              Earn badges, unlock achievements, and get access to exclusive content.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
