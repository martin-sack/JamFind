'use client'

import { Play, Plus, Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface TrackCardProps {
  track: {
    id: string
    title: string
    artist: string
    albumArt?: string
    artworkUrl?: string
    duration?: string
    previewUrl?: string
  }
  rank?: number
  showRank?: boolean
  showXP?: boolean
  xpValue?: number
}

export function TrackCard({ track, rank, showRank = false, showXP = false, xpValue = 0 }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPreview = () => {
    if (track.previewUrl) {
      setIsPlaying(!isPlaying)
      // Audio playback logic would go here
    }
  }

  const handleAddToPlaylist = () => {
    // Add to playlist logic would go here
    console.log(`Added ${track.title} to playlist`)
  }

  return (
    <div 
      className="group relative bg-game-card rounded-xl p-4 card-hover border border-purple-500/20 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* XP Badge */}
      {showXP && xpValue > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-game-body px-2 py-1 rounded-full flex items-center gap-1 neon-glow">
            <Star className="h-3 w-3" />
            +{xpValue} XP
          </div>
        </div>
      )}

      {/* Album Art with Play Button Overlay */}
      <div className="relative mb-4">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {/* Album Art Image */}
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${track.artworkUrl || track.albumArt || '/api/placeholder/300/300'})` }}
          />
          
          {/* Play Button Overlay */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              className="play-button bg-green-500 rounded-full p-3 text-white shadow-lg transition-transform duration-200 hover:scale-110 neon-glow"
              onClick={handlePlayPreview}
            >
              <Play className="h-6 w-6" fill="currentColor" />
            </button>
          </div>

          {/* Rank Badge */}
          {showRank && rank && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-game-heading border border-purple-500/30">
              {rank}
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="font-game-body text-white line-clamp-1 group-hover:text-neon-purple transition-colors">
          {track.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-1 font-game-body">
          {track.artist}
        </p>
        
        {/* Action Buttons */}
        <div 
          className={`flex items-center gap-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30"
            onClick={handleAddToPlaylist}
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30"
          >
            <Heart className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Duration */}
      {track.duration && (
        <div className="absolute top-4 right-4 text-xs text-muted-foreground font-game-body">
          {track.duration}
        </div>
      )}
    </div>
  )
}

// Sample data for development
export const sampleTracks = [
  {
    id: '1',
    title: 'Water',
    artist: 'Tyla',
    albumArt: '/api/placeholder/300/300',
    duration: '3:20',
    previewUrl: '#'
  },
  {
    id: '2',
    title: 'Calm Down',
    artist: 'Rema ft. Selena Gomez',
    albumArt: '/api/placeholder/300/300',
    duration: '3:52',
    previewUrl: '#'
  },
  {
    id: '3',
    title: 'Essence',
    artist: 'Wizkid ft. Tems',
    albumArt: '/api/placeholder/300/300',
    duration: '4:08',
    previewUrl: '#'
  },
  {
    id: '4',
    title: 'Last Last',
    artist: 'Burna Boy',
    albumArt: '/api/placeholder/300/300',
    duration: '2:52',
    previewUrl: '#'
  },
  {
    id: '5',
    title: 'Soweto',
    artist: 'Victony ft. Tempoe',
    albumArt: '/api/placeholder/300/300',
    duration: '2:28',
    previewUrl: '#'
  }
]
