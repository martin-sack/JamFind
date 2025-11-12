// Unified Music API integration utilities
// Replaces Spotify integration with unified music API

export interface MusicTrack {
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
    apple: string;
    youtube: string;
  };
}

export interface MusicPlaylist {
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
      track: MusicTrack;
    }>;
    total: number;
  };
  external_urls: {
    spotify: string;
    apple: string;
    youtube: string;
  };
}

export interface ParsedMusicLink {
  platform: 'spotify' | 'apple' | 'youtube';
  id: string;
  type: 'playlist' | 'album' | 'track';
  url: string;
}

// Unified Music API configuration
const MUSIC_API_BASE_URL = 'https://api.musicapi.com';
const CLIENT_ID = '0a4cf0df-6e24-4edf-9803-0ae451c17e02';

/**
 * Parse music links from various platforms
 */
export function parseMusicLink(url: string): ParsedMusicLink | null {
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
    
    // Apple Music patterns
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
    
    // YouTube patterns
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
    console.error('Error parsing music link:', error);
    return null;
  }
}

/**
 * Make authenticated request to Unified Music API
 */
async function makeMusicApiRequest(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${MUSIC_API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Token ${CLIENT_ID}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Music API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making Music API request:', error);
    throw error;
  }
}

/**
 * Fetch music playlist data from unified API
 */
export async function fetchMusicPlaylist(playlistId: string, platform: string = 'spotify'): Promise<MusicPlaylist | null> {
  try {
    const data = await makeMusicApiRequest(`/public/search/introspection`);
    
    // For now, we'll simulate the response structure
    // In production, this would call the actual unified API endpoints
    const mockPlaylist: MusicPlaylist = {
      id: playlistId,
      name: `Playlist ${playlistId}`,
      description: `A playlist from ${platform}`,
      images: [
        {
          url: `https://via.placeholder.com/300x300?text=${platform}+Playlist`,
          height: 300,
          width: 300
        }
      ],
      owner: {
        display_name: 'Music Platform'
      },
      tracks: {
        items: [
          {
            track: {
              id: 'track1',
              name: 'Sample Track 1',
              artists: [
                {
                  id: 'artist1',
                  name: 'Sample Artist 1'
                }
              ],
              album: {
                id: 'album1',
                name: 'Sample Album',
                images: [
                  {
                    url: 'https://via.placeholder.com/300x300?text=Album+Art',
                    height: 300,
                    width: 300
                  }
                ]
              },
              duration_ms: 180000,
              preview_url: null,
              external_urls: {
                spotify: `https://open.spotify.com/track/track1`,
                apple: `https://music.apple.com/track/track1`,
                youtube: `https://youtube.com/watch?v=track1`
              }
            }
          }
        ],
        total: 1
      },
      external_urls: {
        spotify: `https://open.spotify.com/playlist/${playlistId}`,
        apple: `https://music.apple.com/playlist/${playlistId}`,
        youtube: `https://youtube.com/playlist?list=${playlistId}`
      }
    };
    
    return mockPlaylist;
  } catch (error) {
    console.error('Error fetching music playlist:', error);
    return null;
  }
}

/**
 * Fetch music track data from unified API
 */
export async function fetchMusicTrack(trackId: string, platform: string = 'spotify'): Promise<MusicTrack | null> {
  try {
    const data = await makeMusicApiRequest(`/public/search/introspection`);
    
    // For now, we'll simulate the response structure
    const mockTrack: MusicTrack = {
      id: trackId,
      name: `Track ${trackId}`,
      artists: [
        {
          id: 'artist1',
          name: 'Sample Artist'
        }
      ],
      album: {
        id: 'album1',
        name: 'Sample Album',
        images: [
          {
            url: 'https://via.placeholder.com/300x300?text=Album+Art',
            height: 300,
            width: 300
          }
        ]
      },
      duration_ms: 180000,
      preview_url: null,
      external_urls: {
        spotify: `https://open.spotify.com/track/${trackId}`,
        apple: `https://music.apple.com/track/${trackId}`,
        youtube: `https://youtube.com/watch?v=${trackId}`
      }
    };
    
    return mockTrack;
  } catch (error) {
    console.error('Error fetching music track:', error);
    return null;
  }
}

/**
 * Convert music track to our internal track format
 */
export function musicTrackToInternal(track: MusicTrack) {
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
    externalUrl: track.external_urls.spotify || track.external_urls.apple || track.external_urls.youtube
  };
}

/**
 * Search for tracks across multiple platforms
 */
export async function searchMusicTracks(query: string, limit: number = 20): Promise<MusicTrack[]> {
  try {
    const data = await makeMusicApiRequest(`/public/search/introspection`);
    
    // For now, return mock data
    const mockTracks: MusicTrack[] = [
      {
        id: 'search1',
        name: `Search Result: ${query}`,
        artists: [
          {
            id: 'artist1',
            name: 'Search Artist'
          }
        ],
        album: {
          id: 'album1',
          name: 'Search Album',
          images: [
            {
              url: 'https://via.placeholder.com/300x300?text=Search+Result',
              height: 300,
              width: 300
            }
          ]
        },
        duration_ms: 180000,
        preview_url: null,
        external_urls: {
          spotify: `https://open.spotify.com/track/search1`,
          apple: `https://music.apple.com/track/search1`,
          youtube: `https://youtube.com/watch?v=search1`
        }
      }
    ];
    
    return mockTracks;
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
}
