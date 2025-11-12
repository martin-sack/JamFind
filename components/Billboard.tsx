'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Star, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BillboardTrack {
  id: string
  rank: number
  previousRank: number
  title: string
  artist: string
  albumArt: string
  duration: string
  score: number
  scoreTrend: number[]
  isNew?: boolean
  streams: number
}

interface BillboardProps {
  tracks: BillboardTrack[]
}

export function Billboard({ tracks }: BillboardProps) {
  const getRankChange = (current: number, previous: number) => {
    if (previous === 0) return 'new'
    const change = previous - current
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'same'
  }

  const getChangeAmount = (current: number, previous: number) => {
    if (previous === 0) return 0
    return Math.abs(previous - current)
  }

  const SparklineChart = ({ data }: { data: number[] }) => {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1

    return (
      <div className="flex items-end h-8 gap-0.5">
        {data.map((value, index) => (
          <div
            key={index}
            className="w-1 bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
            style={{
              height: `${((value - minValue) / range) * 100}%`,
              minHeight: '2px'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {tracks.map((track, index) => {
        const rankChange = getRankChange(track.rank, track.previousRank)
        const changeAmount = getChangeAmount(track.rank, track.previousRank)

        return (
          <motion.div
            key={track.id}
            className="group flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            {/* Rank and Change */}
            <div className="flex items-center gap-3 min-w-16">
              <div className="text-2xl font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                {track.rank}
              </div>
              
              {rankChange === 'new' && (
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  NEW
                </div>
              )}
              
              {rankChange === 'up' && (
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold ml-1">{changeAmount}</span>
                </div>
              )}
              
              {rankChange === 'down' && (
                <div className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-semibold ml-1">{changeAmount}</span>
                </div>
              )}
            </div>

            {/* Album Art */}
            <div className="relative">
              <div 
                className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500"
                style={{ backgroundImage: `url(${track.albumArt})`, backgroundSize: 'cover' }}
              />
              <motion.button
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded flex items-center justify-center transition-all duration-200"
                whileHover={{ scale: 1.1 }}
              >
                <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
              </motion.button>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {track.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artist}
              </p>
            </div>

            {/* Score Trend Chart */}
            <div className="hidden md:block w-20">
              <SparklineChart data={track.scoreTrend} />
            </div>

            {/* Score and Streams */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                <span>{track.score}</span>
              </div>
              <div>
                {track.streams.toLocaleString()} streams
              </div>
            </div>

            {/* Duration */}
            <div className="text-sm text-muted-foreground">
              {track.duration}
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Star className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// Sample data for development
export const sampleBillboardTracks: BillboardTrack[] = [
  {
    id: '1',
    rank: 1,
    previousRank: 2,
    title: 'Water',
    artist: 'Tyla',
    albumArt: '/api/placeholder/300/300',
    duration: '3:20',
    score: 95,
    scoreTrend: [85, 88, 90, 92, 95],
    streams: 24567890
  },
  {
    id: '2',
    rank: 2,
    previousRank: 1,
    title: 'Calm Down',
    artist: 'Rema ft. Selena Gomez',
    albumArt: '/api/placeholder/300/300',
    duration: '3:52',
    score: 92,
    scoreTrend: [95, 94, 93, 92, 92],
    streams: 19876543
  },
  {
    id: '3',
    rank: 3,
    previousRank: 5,
    title: 'Essence',
    artist: 'Wizkid ft. Tems',
    albumArt: '/api/placeholder/300/300',
    duration: '4:08',
    score: 89,
    scoreTrend: [80, 82, 85, 87, 89],
    streams: 15678901
  },
  {
    id: '4',
    rank: 4,
    previousRank: 3,
    title: 'Last Last',
    artist: 'Burna Boy',
    albumArt: '/api/placeholder/300/300',
    duration: '2:52',
    score: 87,
    scoreTrend: [90, 89, 88, 87, 87],
    streams: 14325678
  },
  {
    id: '5',
    rank: 5,
    previousRank: 0,
    title: 'Soweto',
    artist: 'Victony ft. Tempoe',
    albumArt: '/api/placeholder/300/300',
    duration: '2:28',
    score: 85,
    scoreTrend: [70, 75, 80, 83, 85],
    isNew: true,
    streams: 9876543
  },
  {
    id: '6',
    rank: 6,
    previousRank: 4,
    title: 'Rush',
    artist: 'Ayra Starr',
    albumArt: '/api/placeholder/300/300',
    duration: '3:05',
    score: 83,
    scoreTrend: [85, 84, 83, 83, 83],
    streams: 8765432
  },
  {
    id: '7',
    rank: 7,
    previousRank: 8,
    title: 'Terminator',
    artist: 'Asake',
    albumArt: '/api/placeholder/300/300',
    duration: '2:35',
    score: 81,
    scoreTrend: [75, 77, 79, 80, 81],
    streams: 7654321
  },
  {
    id: '8',
    rank: 8,
    previousRank: 6,
    title: 'Sability',
    artist: 'Ayra Starr',
    albumArt: '/api/placeholder/300/300',
    duration: '2:46',
    score: 79,
    scoreTrend: [80, 79, 79, 79, 79],
    streams: 6543210
  },
  {
    id: '9',
    rank: 9,
    previousRank: 10,
    title: 'People',
    artist: 'Libianca',
    albumArt: '/api/placeholder/300/300',
    duration: '3:04',
    score: 77,
    scoreTrend: [70, 72, 74, 76, 77],
    streams: 5432109
  },
  {
    id: '10',
    rank: 10,
    previousRank: 7,
    title: 'Mnike',
    artist: 'Tyler ICU ft. Tumelo_za',
    albumArt: '/api/placeholder/300/300',
    duration: '6:30',
    score: 75,
    scoreTrend: [78, 77, 76, 75, 75],
    streams: 4321098
  }
]
