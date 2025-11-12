'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { TrackCard } from '@/components/TrackCard';
import { HorizontalSection } from '@/components/HorizontalSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Plus, Music, Users, MapPin, Filter, Search, TrendingUp, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album?: string;
  durationSec?: number;
  artworkUrl?: string;
  genres: string[];
  moods: string[];
  country?: string;
  submitterCount: number;
  uniqueCountries: number;
  rank: number;
  platforms: string[];
  score: number;
  velocity?: number;
  hotScore?: number;
}

interface FilterOption {
  name: string;
  count: number;
}

interface DiscoverData {
  tracks: Track[];
  total: number;
  page: number;
  hasMore: boolean;
  mode: string;
  filters: {
    genre?: string;
    mood?: string;
    region?: string;
    search?: string;
  };
}

interface Filters {
  genre?: string;
  mood?: string;
  region?: string;
  search?: string;
}

export function DiscoverClient() {
  const [mode, setMode] = useState<'hot' | 'rising' | 'all-time'>('all-time');
  const [filters, setFilters] = useState<Filters>({});
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<{
    genres: FilterOption[];
    moods: FilterOption[];
    regions: FilterOption[];
  }>({ genres: [], moods: [], regions: [] });

  // Fetch available filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/discover', { method: 'POST' });
        const data = await response.json();
        setAvailableFilters(data);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch tracks with current filters and mode
  const fetchTracks = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    const currentPage = reset ? 1 : page;
    
    try {
      const params = new URLSearchParams({
        mode,
        page: currentPage.toString(),
        limit: '20',
        ...filters,
      });
      
      const response = await fetch(`/api/discover?${params}`);
      const data: DiscoverData = await response.json();
      
      if (reset) {
        setTracks(data.tracks);
      } else {
        setTracks(prev => [...prev, ...data.tracks]);
      }
      
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setLoading(false);
    }
  }, [mode, filters, page, loading]);

  // Initial load and when filters/mode change
  useEffect(() => {
    setPage(1);
    fetchTracks(true);
  }, [mode, filters]);

  // Load more tracks
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchTracks(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value?: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === prev[key] ? undefined : value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-800 to-pink-700">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Your Sound
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Personalized recommendations based on your taste, location, and community activity
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Play Weekly Mix
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <motion.section
          className="bg-card border-b"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Genre Filter */}
              <div>
                <h3 className="font-semibold mb-3">Genre</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.genres.map(genre => (
                    <button
                      key={genre.name}
                      onClick={() => handleFilterChange('genre', genre.name)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filters.genre === genre.name
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {genre.name} ({genre.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Filter */}
              <div>
                <h3 className="font-semibold mb-3">Mood</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.moods.map(mood => (
                    <button
                      key={mood.name}
                      onClick={() => handleFilterChange('mood', mood.name)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filters.mood === mood.name
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {mood.name} ({mood.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Filter */}
              <div>
                <h3 className="font-semibold mb-3">Region</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.regions.map(region => (
                    <button
                      key={region.name}
                      onClick={() => handleFilterChange('region', region.name)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filters.region === region.name
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {region.name} ({region.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search and Clear */}
            <div className="flex gap-4 mt-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search tracks and artists..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Ranking Mode Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hot" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Hot
            </TabsTrigger>
            <TabsTrigger value="rising" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rising
            </TabsTrigger>
            <TabsTrigger value="all-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {filters.genre && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Genre: {filters.genre}
                  <button onClick={() => handleFilterChange('genre')}>×</button>
                </div>
              )}
              {filters.mood && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Mood: {filters.mood}
                  <button onClick={() => handleFilterChange('mood')}>×</button>
                </div>
              )}
              {filters.region && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Region: {filters.region}
                  <button onClick={() => handleFilterChange('region')}>×</button>
                </div>
              )}
              {filters.search && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Search: {filters.search}
                  <button onClick={() => handleFilterChange('search')}>×</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map((track, index) => (
            <motion.div
              key={`${track.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="bg-card rounded-lg p-4 card-hover">
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {track.rank}
                  </div>
                  <div className="flex gap-1">
                    {track.platforms.map(platform => (
                      <div
                        key={platform}
                        className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs"
                        title={platform}
                      >
                        {platform.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
                
                <TrackCard track={track} />
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{track.submitterCount}</span>
                  </div>
                  {track.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{track.country}</span>
                    </div>
                  )}
                  {mode === 'rising' && track.velocity && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{track.velocity.toFixed(1)}/hr</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {/* No Results */}
        {tracks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
