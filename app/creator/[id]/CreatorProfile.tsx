'use client'

import { useState, useEffect } from 'react'
import { TrackCard } from '@/components/TrackCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Heart, 
  Share2, 
  Award, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Music,
  Coins,
  Trophy,
  Verified
} from 'lucide-react'

interface CreatorProfileProps {
  creatorId: string
}

interface CreatorData {
  id: string
  name: string
  handle: string
  email: string
  country: string
  bio: string
  profileImage: string
  coverImage: string
  socialLinks: Record<string, string>
  isVerified: boolean
  stats: {
    totalSubmissions: number
    totalTracksUploaded: number
    totalTipsReceived: number
    totalTipsGiven: number
    streakCount: number
    totalTipAmount: number
    totalTipTransactions: number
  }
  badges: Array<{
    id: string
    type: string
    awardedAt: string
    metadata: Record<string, any>
  }>
  recentPlaylists: Array<{
    id: string
    title: string
    weekStartDate: string
    weekEndDate: string
    moodTags: string[]
    trackCount: number
    tracks: Array<{
      id: string
      title: string
      artist: string
      artworkUrl: string
    }>
  }>
  recentChallenges: Array<{
    id: string
    theme: string
    weekStart: string
    track: {
      id: string
      title: string
      artist: string
      artworkUrl: string
    }
    rank: number
    pointsAwarded: number
    submittedAt: string
  }>
  weeklyPerformance: Array<{
    weekStartDate: string
    track: {
      id: string
      title: string
      artist: string
    }
    submitterCount: number
    uniqueCountries: number
    rank: number
  }>
}

export function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const [creator, setCreator] = useState<CreatorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        const response = await fetch(`/api/creator/${creatorId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch creator profile')
        }
        const data = await response.json()
        setCreator(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCreatorProfile()
  }, [creatorId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading creator profile...</p>
        </div>
      </div>
    )
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error || 'Creator not found'}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (cents: number) => {
    return `GHS ${(cents / 100).toFixed(2)}`
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'verified':
        return 'bg-blue-500'
      case 'top_creator':
        return 'bg-yellow-500'
      case 'rising_star':
        return 'bg-green-500'
      case 'challenge_winner':
        return 'bg-purple-500'
      case 'streak_master':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'verified':
        return <Verified className="h-3 w-3" />
      case 'top_creator':
        return <Trophy className="h-3 w-3" />
      case 'rising_star':
        return <TrendingUp className="h-3 w-3" />
      case 'challenge_winner':
        return <Award className="h-3 w-3" />
      case 'streak_master':
        return <Calendar className="h-3 w-3" />
      default:
        return <Star className="h-3 w-3" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div 
        className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 relative"
        style={{
          backgroundImage: creator.coverImage ? `url(${creator.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-card rounded-2xl p-8 shadow-lg border">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-background overflow-hidden">
                {creator.profileImage ? (
                  <img 
                    src={creator.profileImage} 
                    alt={creator.name || 'Creator'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {creator.name?.charAt(0) || 'C'}
                  </div>
                )}
              </div>
              {creator.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1 border-2 border-background">
                  <Verified className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {creator.name || 'Anonymous Creator'}
                </h1>
                {creator.isVerified && (
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    <Verified className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4">
                @{creator.handle || creator.email.split('@')[0]}
              </p>

              {creator.bio && (
                <p className="text-foreground mb-4 max-w-2xl">{creator.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {creator.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{creator.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  <span>{creator.stats.totalSubmissions} submissions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{creator.stats.totalTracksUploaded} tracks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{creator.stats.streakCount} week streak</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button>
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Coins className="h-4 w-4 mr-2" />
                  Tip Creator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {creator.stats.totalSubmissions}
            </div>
            <div className="text-sm text-muted-foreground">Weekly Submissions</div>
          </div>
          <div className="bg-card rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {creator.stats.totalTracksUploaded}
            </div>
            <div className="text-sm text-muted-foreground">Tracks Uploaded</div>
          </div>
          <div className="bg-card rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {creator.stats.streakCount}
            </div>
            <div className="text-sm text-muted-foreground">Week Streak</div>
          </div>
          <div className="bg-card rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {formatCurrency(creator.stats.totalTipAmount)}
            </div>
            <div className="text-sm text-muted-foreground">Tips Received</div>
          </div>
        </div>

        {/* Badges */}
        {creator.badges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Badges & Achievements</h2>
            <div className="flex flex-wrap gap-3">
              {creator.badges.map((badge) => (
                <Badge 
                  key={badge.id}
                  className={`${getBadgeColor(badge.type)} text-white px-3 py-2`}
                >
                  {getBadgeIcon(badge.type)}
                  <span className="ml-2 capitalize">
                    {badge.type.replace('_', ' ')}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Playlists */}
        {creator.recentPlaylists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.recentPlaylists.map((playlist) => (
                <div key={playlist.id} className="bg-card rounded-xl p-6 card-hover">
                  <h3 className="font-semibold text-foreground mb-2">{playlist.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(playlist.weekStartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {playlist.moodTags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {playlist.tracks.slice(0, 3).map((track) => (
                      <div key={track.id} className="flex items-center gap-3 text-sm">
                        <div 
                          className="w-8 h-8 rounded bg-cover bg-center"
                          style={{ backgroundImage: `url(${track.artworkUrl})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{track.title}</div>
                          <div className="text-muted-foreground text-xs truncate">
                            {track.artist}
                          </div>
                        </div>
                      </div>
                    ))}
                    {playlist.trackCount > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{playlist.trackCount - 3} more tracks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenge Participation */}
        {creator.recentChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Challenge Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creator.recentChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-card rounded-xl p-6 card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{challenge.theme}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(challenge.weekStart).toLocaleDateString()}
                      </p>
                    </div>
                    {challenge.rank && (
                      <Badge variant="secondary" className="bg-yellow-500 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        #{challenge.rank}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${challenge.track.artworkUrl})` }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{challenge.track.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {challenge.track.artist}
                      </div>
                    </div>
                  </div>
                  {challenge.pointsAwarded > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      +{challenge.pointsAwarded} XP earned
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Performance */}
        {creator.weeklyPerformance.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Weekly Performance</h2>
            <div className="bg-card rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creator.weeklyPerformance.slice(0, 4).map((performance, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-semibold text-foreground mb-2">
                      {new Date(performance.weekStartDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      #{performance.rank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {performance.submitterCount} submissions
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {performance.uniqueCountries} countries
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
