'use client'

import { Button } from '@/components/ui/button'
import { Trophy, Award, TrendingUp, Globe, MapPin } from 'lucide-react'
import { useState } from 'react'

interface LeaderboardPlayer {
  id: string
  name: string
  avatar: string
  points: number
  level: number
  region: string
  rank: number
  change: 'up' | 'down' | 'same'
  changeAmount?: number
}

export default function LeaderboardClient() {
  const [selectedRegion, setSelectedRegion] = useState('global')
  
  const regions = [
    { id: 'global', name: 'Global', icon: Globe },
    { id: 'ghana', name: 'Ghana', icon: MapPin },
    { id: 'nigeria', name: 'Nigeria', icon: MapPin },
    { id: 'south-africa', name: 'South Africa', icon: MapPin },
    { id: 'kenya', name: 'Kenya', icon: MapPin },
  ]

  const leaderboardData: LeaderboardPlayer[] = [
    {
      id: '1',
      name: 'MusicMaster42',
      avatar: '🎵',
      points: 1250,
      level: 12,
      region: 'global',
      rank: 1,
      change: 'up',
      changeAmount: 2
    },
    {
      id: '2',
      name: 'BeatHunter',
      avatar: '🥁',
      points: 980,
      level: 10,
      region: 'nigeria',
      rank: 2,
      change: 'same'
    },
    {
      id: '3',
      name: 'RhythmRider',
      avatar: '🎸',
      points: 870,
      level: 9,
      region: 'ghana',
      rank: 3,
      change: 'down',
      changeAmount: 1
    },
    {
      id: '4',
      name: 'MelodyMaker',
      avatar: '🎹',
      points: 760,
      level: 8,
      region: 'south-africa',
      rank: 4,
      change: 'up',
      changeAmount: 3
    },
    {
      id: '5',
      name: 'SoundSeeker',
      avatar: '🎧',
      points: 650,
      level: 7,
      region: 'kenya',
      rank: 5,
      change: 'up',
      changeAmount: 1
    },
    {
      id: '6',
      name: 'HarmonyHero',
      avatar: '🎤',
      points: 540,
      level: 6,
      region: 'global',
      rank: 6,
      change: 'down',
      changeAmount: 2
    },
    {
      id: '7',
      name: 'BassBoss',
      avatar: '🎸',
      points: 430,
      level: 5,
      region: 'nigeria',
      rank: 7,
      change: 'same'
    },
    {
      id: '8',
      name: 'TempoTamer',
      avatar: '🥁',
      points: 320,
      level: 4,
      region: 'ghana',
      rank: 8,
      change: 'up',
      changeAmount: 1
    },
    {
      id: '9',
      name: 'ChordChampion',
      avatar: '🎹',
      points: 210,
      level: 3,
      region: 'south-africa',
      rank: 9,
      change: 'down',
      changeAmount: 1
    },
    {
      id: '10',
      name: 'VibeVoyager',
      avatar: '🎧',
      points: 180,
      level: 2,
      region: 'kenya',
      rank: 10,
      change: 'up',
      changeAmount: 2
    }
  ]

  const filteredPlayers = selectedRegion === 'global' 
    ? leaderboardData 
    : leaderboardData.filter(player => player.region === selectedRegion)

  const topPlayer = filteredPlayers[0]

  return (
    <div className="min-h-screen bg-game-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-green-900/80 animate-gradient-shift">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-game-card border border-purple-500/30 mb-6">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-game-body text-neon-green">Live Leaderboard</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-game-title text-white mb-6">
              Global <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Leaderboard</span>
            </h1>
            
            <p className="text-xl font-game-body text-white/80 mb-8 max-w-2xl mx-auto">
              Compete with music lovers worldwide. Climb the ranks and earn exclusive rewards.
            </p>

            {/* Top Player Highlight */}
            {topPlayer && (
              <div className="bg-game-card rounded-2xl p-6 border border-yellow-500/30 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{topPlayer.avatar}</div>
                    <div>
                      <div className="font-game-heading text-white">{topPlayer.name}</div>
                      <div className="text-sm font-game-body text-muted-foreground">Level {topPlayer.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-game-title text-yellow-400">{topPlayer.points} XP</div>
                    <div className="text-xs font-game-body text-muted-foreground">#1 Rank</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-game-body text-yellow-400">Top Discoverer of the Week</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Region Filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {regions.map((region) => {
              const Icon = region.icon
              return (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  className={`
                    font-game-body transition-all duration-200
                    ${selectedRegion === region.id 
                      ? 'btn-game-primary' 
                      : 'border-neon-purple text-white hover:bg-purple-500/10'
                    }
                  `}
                  onClick={() => setSelectedRegion(region.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {region.name}
                </Button>
              )
            })}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-4 px-4 font-game-heading text-muted-foreground">Rank</th>
                    <th className="text-left py-4 px-4 font-game-heading text-muted-foreground">Player</th>
                    <th className="text-left py-4 px-4 font-game-heading text-muted-foreground">Level</th>
                    <th className="text-right py-4 px-4 font-game-heading text-muted-foreground">Points</th>
                    <th className="text-center py-4 px-4 font-game-heading text-muted-foreground">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr 
                      key={player.id}
                      className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-game-heading
                            ${player.rank === 1 ? 'bg-yellow-500 text-black' : 
                              player.rank === 2 ? 'bg-gray-400 text-black' : 
                              player.rank === 3 ? 'bg-orange-500 text-black' : 
                              'bg-purple-500/20 text-white'}
                          `}>
                            {player.rank}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{player.avatar}</div>
                          <div>
                            <div className="font-game-body text-white">{player.name}</div>
                            <div className="text-xs font-game-body text-muted-foreground capitalize">
                              {player.region.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full neon-pulse"></div>
                          <span className="font-game-body text-white">Level {player.level}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-game-heading text-neon-green">{player.points} XP</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {player.change === 'up' && (
                          <div className="inline-flex items-center gap-1 text-green-400">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-game-body">+{player.changeAmount}</span>
                          </div>
                        )}
                        {player.change === 'down' && (
                          <div className="inline-flex items-center gap-1 text-red-400">
                            <TrendingUp className="h-4 w-4 rotate-180" />
                            <span className="text-sm font-game-body">-{player.changeAmount}</span>
                          </div>
                        )}
                        {player.change === 'same' && (
                          <div className="text-sm font-game-body text-muted-foreground">—</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="border-neon-purple text-white hover:bg-purple-500/10">
                Load More Players
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30 text-center">
              <div className="text-3xl font-game-title text-neon-purple mb-2">50K+</div>
              <div className="font-game-body text-muted-foreground">Active Players</div>
            </div>
            <div className="bg-game-card rounded-2xl p-6 border border-green-500/30 text-center">
              <div className="text-3xl font-game-title text-neon-green mb-2">1.2M</div>
              <div className="font-game-body text-muted-foreground">Total XP Earned</div>
            </div>
            <div className="bg-game-card rounded-2xl p-6 border border-pink-500/30 text-center">
              <div className="text-3xl font-game-title text-neon-pink mb-2">$15K</div>
              <div className="font-game-body text-muted-foreground">Weekly Prize Pool</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
