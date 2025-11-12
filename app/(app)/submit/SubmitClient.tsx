'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Music, CheckCircle, ExternalLink, Clock, AlertTriangle } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    country?: string;
  };
  previewUrl?: string;
  artworkUrl?: string;
  country?: string;
}

interface PlaylistItem {
  id: string;
  trackId: string;
  position: number;
  track: Track;
}

interface Playlist {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  title?: string;
  items: PlaylistItem[];
}

interface SubmitClientProps {
  initialPlaylist: Playlist;
}

interface SearchResult {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    country?: string;
  };
  previewUrl?: string;
  artworkUrl?: string;
  country?: string;
  platform?: string;
  platformColor?: string;
  platformIcon?: string;
}

function SortableItem({ item, onRemove }: { item: PlaylistItem; onRemove: (itemId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-4 bg-card border rounded-lg cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
        {item.position}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">
          {item.track.title}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {item.track.artist.name}
        </div>
      </div>

      {item.track.previewUrl && (
        <audio
          controls
          className="h-8"
          preload="none"
        >
          <source src={item.track.previewUrl} type="audio/mpeg" />
        </audio>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function SubmitClient({ initialPlaylist }: SubmitClientProps) {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState({
    title: '',
    artistName: '',
    country: '',
    previewUrl: '',
    artworkUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get platform badge info
  const getPlatformBadge = (url: string) => {
    if (url.includes('spotify.com')) {
      return { platform: 'Spotify', color: 'bg-green-500', icon: '🎵' };
    } else if (url.includes('music.apple.com')) {
      return { platform: 'Apple Music', color: 'bg-pink-500', icon: '🎧' };
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { platform: 'YouTube', color: 'bg-red-500', icon: '▶️' };
    }
    return { platform: 'Unknown', color: 'bg-gray-500', icon: '🎵' };
  };

  // Search for tracks
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setParseError(null);
      return;
    }

    setIsSearching(true);
    setParseError(null);

    try {
      // Check if it's a URL first
      if (query.includes('spotify.com') || query.includes('music.apple.com') || query.includes('youtube.com') || query.includes('youtu.be')) {
        setIsParsingUrl(true);
        
        try {
          const response = await fetch('/api/music/parse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: query }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            if (data.tracks.length > 0) {
              // Convert parsed tracks to search results with platform info
              const platformBadge = getPlatformBadge(query);
              const parsedResults: SearchResult[] = data.tracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: { id: track.artist.id, name: track.artist.name },
                previewUrl: track.previewUrl,
                artworkUrl: track.artworkUrl,
                platform: platformBadge.platform,
                platformColor: platformBadge.color,
                platformIcon: platformBadge.icon,
              }));
              setSearchResults(parsedResults);
              setShowSuccessToast(true);
              setTimeout(() => setShowSuccessToast(false), 3000);
              return;
            } else {
              setParseError('No tracks found in this playlist');
            }
          } else {
            setParseError(data.error || 'Failed to parse URL');
          }
        } catch (error) {
          console.error('URL parsing error:', error);
          setParseError('Failed to parse music URL');
        } finally {
          setIsParsingUrl(false);
        }
      }

      // If not a URL or parsing failed, use mock search for now
      // TODO: Implement actual search API with unified music API
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Sample Track 1',
          artist: { id: '1', name: 'Sample Artist 1' },
          previewUrl: 'https://example.com/preview1.mp3',
          platform: 'Spotify',
          platformColor: 'bg-green-500',
          platformIcon: '🎵',
        },
        {
          id: '2',
          title: 'Sample Track 2',
          artist: { id: '2', name: 'Sample Artist 2' },
          previewUrl: 'https://example.com/preview2.mp3',
          platform: 'Apple Music',
          platformColor: 'bg-pink-500',
          platformIcon: '🎧',
        },
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setParseError('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Add track to playlist
  const handleAddTrack = async (track: SearchResult) => {
    if (playlist.items.length >= 10) {
      alert('Playlist already has 10 tracks');
      return;
    }

    const nextPosition = playlist.items.length + 1;

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id,
          position: nextPosition,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add track');
      }

      const data = await response.json();
      setPlaylist(prev => ({
        ...prev,
        items: data.items,
      }));
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding track:', error);
      alert(error instanceof Error ? error.message : 'Failed to add track');
    }
  };

  // Remove track from playlist
  const handleRemoveTrack = async (itemId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove track');
      }

      const data = await response.json();
      setPlaylist(prev => ({
        ...prev,
        items: data.items,
      }));
    } catch (error) {
      console.error('Error removing track:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove track');
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = playlist.items.findIndex(item => item.id === active.id);
    const newIndex = playlist.items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const newItems = arrayMove(playlist.items, oldIndex, newIndex);
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setPlaylist(prev => ({
      ...prev,
      items: updatedItems,
    }));

    // Update positions in database
    try {
      // We'll update all positions to ensure consistency
      for (const item of updatedItems) {
        await fetch(`/api/playlists/${playlist.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackId: item.trackId,
            position: item.position,
          }),
        });
      }
    } catch (error) {
      console.error('Error updating positions:', error);
      // Revert to original state on error
      setPlaylist(prev => ({ ...prev, items: prev.items }));
    }
  };

  // Quick create track
  const handleQuickCreate = async () => {
    if (!quickCreateData.title.trim() || !quickCreateData.artistName.trim()) {
      alert('Title and artist name are required');
      return;
    }

    try {
      const response = await fetch('/api/tracks/quick-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quickCreateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create track');
      }

      const data = await response.json();
      
      if (data.created) {
        // Add the newly created track to playlist
        await handleAddTrack(data.track);
      } else {
        // Track already exists, add it
        await handleAddTrack(data.track);
      }

      setShowQuickCreate(false);
      setQuickCreateData({
        title: '',
        artistName: '',
        country: '',
        previewUrl: '',
        artworkUrl: '',
      });
    } catch (error) {
      console.error('Error creating track:', error);
      alert(error instanceof Error ? error.message : 'Failed to create track');
    }
  };

  // Submit playlist
  const handleSubmit = async () => {
    if (playlist.items.length !== 10) {
      alert('Playlist must have exactly 10 tracks to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit playlist');
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting playlist:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Playlist Submitted Successfully!
        </h2>
        <p className="text-muted-foreground mb-6">
          Your weekly picks have been submitted. You're now eligible for rewards if your tracks chart!
        </p>
        <Button onClick={() => setSubmitSuccess(false)}>
          Create Another Playlist
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Playlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your 10 Tracks ({playlist.items.length}/10)</span>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Week of {new Date(playlist.weekStartDate).toLocaleDateString()}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playlist.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Add tracks to build your weekly playlist</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playlist.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {playlist.items.map(item => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveTrack}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {playlist.items.length === 10 && (
            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Playlist'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Column - Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Add Tracks</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tracks or paste URL..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {/* Loading states */}
            {(isSearching || isParsingUrl) && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isParsingUrl ? 'Parsing music URL...' : 'Searching...'}
                </p>
              </div>
            )}

            {/* Error message */}
            {parseError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive text-sm">{parseError}</p>
              </div>
            )}

            {/* Success toast */}
            {showSuccessToast && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">✓ Playlist parsed successfully!</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map(track => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleAddTrack(track)}
                  >
                    {/* Track artwork */}
                    {track.artworkUrl && (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {track.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {track.artist.name}
                      </div>
                      
                      {/* Platform badge and preview info */}
                      <div className="flex items-center gap-2 mt-1">
                        {track.platform && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${track.platformColor || 'bg-gray-100'} text-gray-800`}
                          >
                            <span className="mr-1">{track.platformIcon}</span>
                            {track.platform}
                          </Badge>
                        )}
                        
                        {track.previewUrl && (
                          <Badge variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Preview
                          </Badge>
                        )}
                        
                        {!track.previewUrl && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            No Preview
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && !isParsingUrl && !parseError && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tracks found for "{searchQuery}"</p>
                <Button
                  variant="outline"
                  onClick={() => setShowQuickCreate(true)}
                  className="mt-2"
                >
                  Quick Create Track
                </Button>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Search for tracks to add to your playlist</p>
                <p className="text-sm mt-1">Or paste a Spotify, Apple Music, or YouTube URL</p>
              </div>
            )}
          </div>

          {/* Quick Create Modal */}
          {showQuickCreate && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Quick Create Track</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Track Title"
                    value={quickCreateData.title}
                    onChange={(e) => setQuickCreateData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Artist Name"
                    value={quickCreateData.artistName}
                    onChange={(e) => setQuickCreateData(prev => ({ ...prev, artistName: e.target.value }))}
                  />
                  <Input
                    placeholder="Country (optional)"
                    value={quickCreateData.country}
                    onChange={(e) => setQuickCreateData(prev => ({ ...prev, country: e.target.value }))}
                  />
                  <Input
                    placeholder="Preview URL (optional)"
                    value={quickCreateData.previewUrl}
                    onChange={(e) => setQuickCreateData(prev => ({ ...prev, previewUrl: e.target.value }))}
                  />
                  <Input
                    placeholder="Artwork URL (optional)"
                    value={quickCreateData.artworkUrl}
                    onChange={(e) => setQuickCreateData(prev => ({ ...prev, artworkUrl: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickCreate}
                      className="flex-1"
                    >
                      Create & Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQuickCreate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
