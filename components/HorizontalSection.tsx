'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'

interface HorizontalSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showAllLink?: string
}

export function HorizontalSection({ title, subtitle, children, showAllLink }: HorizontalSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8

    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const { scrollLeft, scrollWidth, clientWidth } = container

    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  return (
    <section className="relative animate-fade-in-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {showAllLink && (
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            Show All
          </Button>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          onScroll={handleScroll}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

// Sample data for different sections
export const sectionData = {
  trendingGhana: {
    title: "Trending in Ghana",
    subtitle: "What's hot in Accra right now",
    tracks: [
      {
        id: '1',
        title: 'Kpo K3k3',
        artist: 'Stonebwoy',
        albumArt: '/api/placeholder/300/300',
        duration: '3:15'
      },
      {
        id: '2',
        title: 'Non Living Thing',
        artist: 'Sarkodie',
        albumArt: '/api/placeholder/300/300',
        duration: '3:45'
      },
      {
        id: '3',
        title: 'Obaa Hemaa',
        artist: 'Shatta Wale',
        albumArt: '/api/placeholder/300/300',
        duration: '3:20'
      },
      {
        id: '4',
        title: 'Country Side',
        artist: 'Black Sherif',
        albumArt: '/api/placeholder/300/300',
        duration: '3:10'
      },
      {
        id: '5',
        title: 'Over',
        artist: 'R2Bees',
        albumArt: '/api/placeholder/300/300',
        duration: '3:30'
      }
    ]
  },
  trendingNigeria: {
    title: "Trending in Nigeria",
    subtitle: "Lagos vibes taking over",
    tracks: [
      {
        id: '1',
        title: 'Calm Down',
        artist: 'Rema ft. Selena Gomez',
        albumArt: '/api/placeholder/300/300',
        duration: '3:52'
      },
      {
        id: '2',
        title: 'Essence',
        artist: 'Wizkid ft. Tems',
        albumArt: '/api/placeholder/300/300',
        duration: '4:08'
      },
      {
        id: '3',
        title: 'Last Last',
        artist: 'Burna Boy',
        albumArt: '/api/placeholder/300/300',
        duration: '2:52'
      },
      {
        id: '4',
        title: 'Soweto',
        artist: 'Victony ft. Tempoe',
        albumArt: '/api/placeholder/300/300',
        duration: '2:28'
      },
      {
        id: '5',
        title: 'Love Don\'t Cost A Dime',
        artist: 'Ayra Starr',
        albumArt: '/api/placeholder/300/300',
        duration: '2:40'
      }
    ]
  },
  amapianoVibes: {
    title: "Amapiano Vibes",
    subtitle: "South Africa's finest",
    tracks: [
      {
        id: '1',
        title: 'Mnike',
        artist: 'Tyler ICU ft. Tumelo_za',
        albumArt: '/api/placeholder/300/300',
        duration: '6:30'
      },
      {
        id: '2',
        title: 'Paris',
        artist: 'Q-Mark',
        albumArt: '/api/placeholder/300/300',
        duration: '5:45'
      },
      {
        id: '3',
        title: 'Sengizwile',
        artist: 'Gaba Cannal',
        albumArt: '/api/placeholder/300/300',
        duration: '6:15'
      },
      {
        id: '4',
        title: 'Mama',
        artist: 'Josiah De Disciple',
        albumArt: '/api/placeholder/300/300',
        duration: '7:20'
      },
      {
        id: '5',
        title: 'iPlan',
        artist: 'DLALA THUKSIN',
        albumArt: '/api/placeholder/300/300',
        duration: '5:25'
      }
    ]
  },
  afrobeatsRising: {
    title: "Afrobeats Rising",
    subtitle: "The next wave of stars",
    tracks: [
      {
        id: '1',
        title: 'Water',
        artist: 'Tyla',
        albumArt: '/api/placeholder/300/300',
        duration: '3:20'
      },
      {
        id: '2',
        title: 'Rush',
        artist: 'Ayra Starr',
        albumArt: '/api/placeholder/300/300',
        duration: '3:05'
      },
      {
        id: '3',
        title: 'Terminator',
        artist: 'Asake',
        albumArt: '/api/placeholder/300/300',
        duration: '2:35'
      },
      {
        id: '4',
        title: 'Sability',
        artist: 'Ayra Starr',
        albumArt: '/api/placeholder/300/300',
        duration: '2:46'
      },
      {
        id: '5',
        title: 'People',
        artist: 'Libianca',
        albumArt: '/api/placeholder/300/300',
        duration: '3:04'
      }
    ]
  }
}
