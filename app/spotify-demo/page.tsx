'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpotifyEmbedPlayer from '@/components/SpotifyEmbedPlayer';
import PlaylistMetadata from '@/components/PlaylistMetadata';
import { Search, Music, Link } from 'lucide-react';

export default function SpotifyDemoPage() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const playerControllerRef = useRef<any>(null);

  const handleParsePlaylist = async () => {
    if (!playlistUrl.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    setLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const response = await fetch('/api/spotify/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: playlistUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse playlist');
      }

      setParsedData(data);
      
      if (data.parsedLink.platform === 'spotify' && data.parsedLink.type === 'playlist') {
        setCurrentPlaylistId(data.parsedLink.id);
        setCurrentTrackId(null);
      } else if (data.parsedLink.platform === 'spotify' && data.parsedLink.type === 'track') {
        setCurrentTrackId(data.parsedLink.id);
        setCurrentPlaylistId(null);
      }
    } catch (err) {
      console.error('Error parsing playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse playlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerReady = (controller: any) => {
    playerControllerRef.current = controller;
    console.log('Spotify player ready:', controller);
  };

  const handleTrackSelect = (track: any) => {
    console.log('Track selected:', track);
    // You could implement logic to play the specific track here
    // Note: The Spotify iFrame API doesn't support direct track selection within playlists
    // You would need to load the track individually
    setCurrentTrackId(track.id);
    setCurrentPlaylistId(null);
  };

  const examplePlaylists = [
    {
      name: 'Spotify Global Top 50',
      url: 'https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF'
    },
    {
      name: 'Today\'s Top Hits',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
    },
    {
      name: 'Rock Classics',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U'
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Spotify Integration Demo</h1>
        <p className="text-muted-foreground text-lg">
          Test the Spotify Web API and iFrame player integration
        </p>
      </div>

      {/* URL Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Parse Playlist URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Paste Spotify playlist or track URL..."
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleParsePlaylist}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Parsing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Parse
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded text-destructive">
              {error}
            </div>
          )}

          {/* Example Playlists */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePlaylists.map((playlist, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlaylistUrl(playlist.url);
                    setTimeout(() => handleParsePlaylist(), 100);
                  }}
                >
                  {playlist.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {parsedData && (
        <Tabs defaultValue="player" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="metadata">Playlist Info</TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Spotify Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpotifyEmbedPlayer
                  playlistUri={currentPlaylistId || undefined}
                  trackUri={currentTrackId || undefined}
                  height={352}
                  customControls={true}
                  onReady={handlePlayerReady}
                  onTrackChange={(data) => console.log('Track changed:', data)}
                  onPlaybackUpdate={(data) => console.log('Playback update:', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata">
            {currentPlaylistId && (
              <PlaylistMetadata
                playlistId={currentPlaylistId}
                onTrackSelect={handleTrackSelect}
              />
            )}
            {currentTrackId && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Track player is active. Use the Player tab to control playback.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Spotify Web API</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fetch playlist metadata and tracks</li>
                <li>• Client credentials flow for public data</li>
                <li>• Parse URLs from multiple platforms</li>
                <li>• Search functionality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Spotify iFrame API</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Embedded player with custom controls</li>
                <li>• Programmatic playback control</li>
                <li>• Event listeners for state changes</li>
                <li>• Mobile-optimized responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
