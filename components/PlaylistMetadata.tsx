'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpotifyPlaylist, spotifyTrackToInternal } from '@/lib/spotify';
import { Music, Users, Clock, ExternalLink } from 'lucide-react';

interface PlaylistMetadataProps {
  playlistId: string;
  onTrackSelect?: (track: any) => void;
  className?: string;
}

export default function PlaylistMetadata({ 
  playlistId, 
  onTrackSelect,
  className = '' 
}: PlaylistMetadataProps) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylistData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/spotify/playlists/${playlistId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.status}`);
        }
        
        const data = await response.json();
        setPlaylist(data);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError(err instanceof Error ? err.message : 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    }

    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading playlist...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <p className="text-destructive">Error loading playlist</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!playlist) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Playlist not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Playlist Header */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          {playlist.images[0] && (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{playlist.name}</CardTitle>
            {playlist.description && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>By {playlist.owner.display_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>{playlist.tracks.total} tracks</span>
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Spotify
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Track List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Tracks ({playlist.tracks.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playlist.tracks.items.map((item, index) => {
              const track = item.track;
              const internalTrack = spotifyTrackToInternal(track);
              
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onTrackSelect?.(internalTrack)}
                >
                  <div className="flex items-center justify-center w-6 h-6 text-xs text-muted-foreground font-medium">
                    {index + 1}
                  </div>
                  
                  {track.album.images[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {track.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {track.artists.map(artist => artist.name).join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {track.preview_url && (
                      <Badge variant="secondary" className="text-xs">
                        Preview
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
