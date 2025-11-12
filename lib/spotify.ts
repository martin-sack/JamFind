// Spotify Web API integration utilities

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  owner: {
    display_name: string;
  };
  tracks: {
    items: Array<{
      track: SpotifyTrack;
    }>;
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface ParsedPlaylistLink {
  platform: 'spotify' | 'apple' | 'youtube';
  id: string;
  type: 'playlist' | 'album' | 'track';
  url: string;
}

/**
 * Parse playlist links from various platforms
 */
export function parsePlaylistLink(url: string): ParsedPlaylistLink | null {
  try {
    const urlObj = new URL(url);
    
    // Spotify patterns
    if (urlObj.hostname.includes('spotify.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts[0] === 'playlist' && pathParts[1]) {
        return {
          platform: 'spotify',
          id: pathParts[1],
          type: 'playlist',
          url
        };
      }
      
      if (pathParts[0] === 'album' && pathParts[1]) {
        return {
          platform: 'spotify',
          id: pathParts[1],
          type: 'album',
          url
        };
      }
      
      if (pathParts[0] === 'track' && pathParts[1]) {
        return {
          platform: 'spotify',
          id: pathParts[1],
          type: 'track',
          url
        };
      }
    }
    
    // Apple Music patterns (simplified)
    if (urlObj.hostname.includes('music.apple.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const idMatch = urlObj.searchParams.get('i') || pathParts[pathParts.length - 1];
      
      if (idMatch) {
        return {
          platform: 'apple',
          id: idMatch,
          type: 'playlist',
          url
        };
      }
    }
    
    // YouTube patterns (simplified)
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const playlistId = urlObj.searchParams.get('list');
      if (playlistId) {
        return {
          platform: 'youtube',
          id: playlistId,
          type: 'playlist',
          url
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing playlist link:', error);
    return null;
  }
}

/**
 * Get Spotify access token for public data
 */
async function getSpotifyAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Spotify credentials not configured');
      return null;
    }
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      throw new Error(`Spotify token request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

/**
 * Fetch Spotify playlist data
 */
export async function fetchSpotifyPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    if (!accessToken) {
      throw new Error('Could not get Spotify access token');
    }
    
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Spotify API request failed: ${response.status}`);
    }
    
    const playlist: SpotifyPlaylist = await response.json();
    return playlist;
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    return null;
  }
}

/**
 * Fetch Spotify track data
 */
export async function fetchSpotifyTrack(trackId: string): Promise<SpotifyTrack | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    if (!accessToken) {
      throw new Error('Could not get Spotify access token');
    }
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Spotify API request failed: ${response.status}`);
    }
    
    const track: SpotifyTrack = await response.json();
    return track;
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    return null;
  }
}

/**
 * Convert Spotify track to our internal track format
 */
export function spotifyTrackToInternal(track: SpotifyTrack) {
  return {
    id: track.id,
    title: track.name,
    artist: {
      id: track.artists[0]?.id || 'unknown',
      name: track.artists[0]?.name || 'Unknown Artist'
    },
    previewUrl: track.preview_url,
    artworkUrl: track.album.images[0]?.url,
    duration: track.duration_ms,
    externalUrl: track.external_urls.spotify
  };
}

/**
 * Search Spotify for tracks
 */
export async function searchSpotifyTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    if (!accessToken) {
      throw new Error('Could not get Spotify access token');
    }
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Spotify search request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}
