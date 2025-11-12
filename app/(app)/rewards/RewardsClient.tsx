'use client';

import { useState } from 'react';
import { GameXPBar } from '@/components/GameXPBar';
import { Badge } from '@/components/Badge';
import { Trophy, Award, Star, Calendar, TrendingUp, Gift, Zap, Target } from 'lucide-react';
import { formatWeekDisplay } from '@/lib/weeks';

interface Reward {
  id: string;
  weekStart: string;
  points: number;
  reason: string;
  createdAt: string;
}

interface RewardsData {
  totalPoints: number;
  rewards: Reward[];
  latestBadges: string[];
}

interface RewardsClientProps {
  initialData: RewardsData;
}

export default function RewardsClient({ initialData }: RewardsClientProps) {
  const [data] = useState<RewardsData>(initialData);

  // Mock data for game rewards
  const gameData = {
    totalPoints: 420,
    level: 5,
    nextLevelXP: 1000,
    currentXP: 650,
    progress: 65,
    badges: [
      { icon: '🎯', title: 'Sharpshooter', description: 'Submit 5 perfect picks', rarity: 'rare', earned: true },
      { icon: '🚀', title: 'Rising Star', description: 'Reach level 5', rarity: 'common', earned: true },
      { icon: '🏆', title: 'Chart Topper', description: 'Have a #1 track', rarity: 'epic', earned: false },
      { icon: '💎', title: 'Diamond Ear', description: 'Discover 50+ artists', rarity: 'legendary', earned: false },
      { icon: '⚡', title: 'Quick Draw', description: 'Submit within 1 hour', rarity: 'rare', earned: true },
      { icon: '🌟', title: 'Trendsetter', description: 'Start 3 trends', rarity: 'epic', earned: false },
    ]
  };

  return (
    <div className="min-h-screen bg-game-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/80 via-pink-800/80 to-orange-700/80 animate-gradient-shift">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-game-card border border-purple-500/30 mb-6">
              <Gift className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-game-body text-neon-green">Your Game Rewards</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-game-title text-white mb-6">
              Game <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Rewards</span>
            </h1>
            
            <p className="text-xl font-game-body text-white/80 mb-8 max-w-2xl mx-auto">
              Earn XP, unlock badges, and climb the leaderboards. Your music discovery journey pays off!
            </p>

            {/* Big Points Counter */}
            <div className="bg-game-card rounded-2xl p-8 border border-purple-500/30 max-w-md mx-auto mb-8">
              <div className="text-center">
                <div className="text-6xl font-game-title text-neon-purple mb-2 neon-glow">
                  {gameData.totalPoints}
                </div>
                <div className="text-lg font-game-body text-muted-foreground">Total Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Progress Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-game-heading text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-neon-green" />
                Your Progress
              </h2>
              <GameXPBar 
                progress={gameData.progress} 
                currentXP={gameData.currentXP} 
                nextLevelXP={gameData.nextLevelXP} 
                level={gameData.level}
              />
              
              {/* Level Rewards */}
              <div className="mt-6 space-y-3">
                <h3 className="font-game-heading text-white text-sm">Level Rewards</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((level) => (
                    <div 
                      key={level}
                      className={`text-center p-3 rounded-lg border ${
                        gameData.level >= level 
                          ? 'border-green-500/30 bg-green-500/10' 
                          : 'border-muted-foreground/20 bg-black/20'
                      }`}
                    >
                      <div className={`text-sm font-game-body ${
                        gameData.level >= level ? 'text-neon-green' : 'text-muted-foreground'
                      }`}>
                        Level {level}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {level === 5 && 'Exclusive Badge'}
                        {level === 10 && 'Profile Frame'}
                        {level === 15 && 'Early Access'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Badge Progress */}
            <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-game-heading text-white mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-neon-pink" />
                Next Badge
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-game-heading text-white">Chart Topper</h3>
                <p className="text-sm font-game-body text-muted-foreground mt-1">
                  Have a track reach #1 on the charts
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-game-body">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-neon-pink">0/1 tracks</span>
                </div>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-xs font-game-body text-muted-foreground">
                  Submit tracks that could become #1!
                </div>
              </div>
            </div>
          </div>

          {/* Badge Collection */}
          <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-game-heading text-white mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-400" />
              Badge Collection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameData.badges.map((badge, index) => (
                <Badge
                  key={index}
                  icon={badge.icon}
                  title={badge.title}
                  description={badge.description}
                  rarity={badge.rarity as any}
                  earned={badge.earned}
                />
              ))}
            </div>
          </div>

          {/* Rewards History */}
          <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-game-heading text-white mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-neon-green" />
              Rewards History
            </h2>

            {data.rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-game-body">No rewards yet</p>
                <p className="text-sm mt-1 font-game-body">
                  Submit your weekly 10 tracks to start earning points and badges!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-purple-500/20 hover:bg-purple-500/5 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="font-game-body text-white">
                        {reward.reason}
                      </div>
                      <div className="text-sm font-game-body text-muted-foreground">
                        {formatWeekDisplay(new Date(reward.weekStart))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-game-heading text-neon-green text-lg">
                        +{reward.points} XP
                      </div>
                      <div className="text-xs font-game-body text-muted-foreground">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-game-card rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-game-heading text-white mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              How Rewards Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="font-game-heading text-neon-purple mb-2">#1 Track</div>
                <div className="text-2xl font-game-title text-white">+50 XP</div>
                <div className="text-sm font-game-body text-muted-foreground mt-1">
                  Your track reaches #1
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="font-game-heading text-neon-green mb-2">#2 Track</div>
                <div className="text-2xl font-game-title text-white">+30 XP</div>
                <div className="text-sm font-game-body text-muted-foreground mt-1">
                  Your track reaches #2
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <div className="font-game-heading text-neon-pink mb-2">#3 Track</div>
                <div className="text-2xl font-game-title text-white">+20 XP</div>
                <div className="text-sm font-game-body text-muted-foreground mt-1">
                  Your track reaches #3
                </div>
              </div>
            </div>

            <div className="text-sm font-game-body text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Submit exactly 10 tracks every week (Monday-Sunday)
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Tracks are ranked by submission count with tie-breakers
              </p>
              <p className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                Points are awarded to all users who submitted winning tracks
              </p>
              <p className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-400" />
                Artists receive "Charted" badges for their winning tracks
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
