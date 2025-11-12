'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Search, Play, Pause } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  previewUrl?: string;
  artworkUrl?: string;
  duration: number;
  externalUrl: string;
}

export default function MusicDemoPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string>('');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setMetadata(null);
    setTracks([]);

    try {
      const response = await fetch('/api/music/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse URL');
      }

      if (data.success) {
        setMetadata(data.metadata);
        setTracks(data.tracks);
      } else {
        throw new Error('Failed to parse URL');
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to parse URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPreview = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) {
      alert('No preview available for this track');
      return;
    }

    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unified Music API Demo</h1>
        <p className="text-muted-foreground text-lg">
          Test the unified music API integration with Spotify, Apple Music, and YouTube URLs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parse Music URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Paste Spotify, Apple Music, or YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleParseUrl} disabled={isLoading}>
              {isLoading ? 'Parsing...' : 'Parse URL'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Supported URLs:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Spotify: https://open.spotify.com/playlist/...</li>
              <li>Apple Music: https://music.apple.com/playlist/...</li>
              <li>YouTube: https://youtube.com/playlist?list=...</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {metadata.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metadata.image && (
                <div className="flex justify-center">
                  <img
                    src={metadata.image}
                    alt={metadata.name}
                    className="w-48 h-48 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{metadata.name}</h3>
                  {metadata.description && (
                    <p className="text-muted-foreground mt-1">{metadata.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Owner:</span>
                    <p className="text-muted-foreground">{metadata.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tracks:</span>
                    <p className="text-muted-foreground">{metadata.trackCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">Platform:</span>
                    <p className="text-muted-foreground capitalize">{metadata.platform}</p>
                  </div>
                  <div>
                    <span className="font-medium">ID:</span>
                    <p className="text-muted-foreground font-mono text-xs">{metadata.id}</p>
                  </div>
                </div>
                {metadata.externalUrl && (
                  <Button asChild variant="outline">
                    <a href={metadata.externalUrl} target="_blank" rel="noopener noreferrer">
                      Open in {metadata.platform}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracks ({tracks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>

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
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(track.duration)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.previewUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlayPreview(track.id, track.previewUrl)}
                      >
                        {playingTrack === track.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="icon">
                      <a href={track.externalUrl} target="_blank" rel="noopener noreferrer">
                        <Search className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {playingTrack === track.id && track.previewUrl && (
                    <audio
                      autoPlay
                      controls
                      className="ml-4"
                      onEnded={() => setPlayingTrack(null)}
                    >
                      <source src={track.previewUrl} type="audio/mpeg" />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
