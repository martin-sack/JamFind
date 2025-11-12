import { NextRequest, NextResponse } from 'next/server';
import { parseMusicLink, fetchMusicPlaylist, fetchMusicTrack, musicTrackToInternal } from '@/lib/musicapi';

// Enhanced error messages per platform
const PLATFORM_ERROR_MESSAGES = {
  spotify: {
    private: 'This Spotify playlist is private or unavailable.',
    not_found: 'Spotify playlist not found.',
    generic: 'Unable to access Spotify data.'
  },
  apple: {
    private: 'This Apple Music link is private.',
    not_found: 'Apple Music playlist not found.',
    generic: 'Unable to access Apple Music data.'
  },
  youtube: {
    private: 'This YouTube playlist is private or unavailable.',
    not_found: 'YouTube playlist not found.',
    generic: 'Unable to access YouTube data.'
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let success = false;
  let platform = 'unknown';
  let errorType = 'unknown';

  try {
    const { url } = await request.json();

    if (!url) {
      errorType = 'missing_url';
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const parsedLink = parseMusicLink(url);

    if (!parsedLink) {
      errorType = 'invalid_url';
      return NextResponse.json(
        { error: 'Invalid music URL or unsupported platform' },
        { status: 400 }
      );
    }

    platform = parsedLink.platform;
    let metadata = null;
    let tracks: any[] = [];

    // Handle music playlists across all platforms
    if (parsedLink.type === 'playlist') {
      const playlist = await fetchMusicPlaylist(parsedLink.id, parsedLink.platform);
      
      if (playlist) {
        metadata = {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          image: playlist.images[0]?.url,
          owner: playlist.owner.display_name,
          trackCount: playlist.tracks.total,
          externalUrl: playlist.external_urls[parsedLink.platform] || playlist.external_urls.spotify,
          platform: parsedLink.platform
        };

        // Convert tracks to internal format
        tracks = playlist.tracks.items
          .filter(item => item.track) // Filter out null tracks
          .map(item => musicTrackToInternal(item.track));
      }
    }
    // Handle music tracks across all platforms
    else if (parsedLink.type === 'track') {
      const track = await fetchMusicTrack(parsedLink.id, parsedLink.platform);
      
      if (track) {
        metadata = {
          id: track.id,
          name: track.name,
          description: `Track by ${track.artists.map(a => a.name).join(', ')}`,
          image: track.album.images[0]?.url,
          owner: track.artists[0]?.name || 'Unknown Artist',
          trackCount: 1,
          externalUrl: track.external_urls[parsedLink.platform] || track.external_urls.spotify,
          platform: parsedLink.platform
        };

        tracks = [musicTrackToInternal(track)];
      }
    }
    // Handle albums (treat as playlists)
    else if (parsedLink.type === 'album') {
      const album = await fetchMusicPlaylist(parsedLink.id, parsedLink.platform);
      
      if (album) {
        metadata = {
          id: album.id,
          name: album.name,
          description: album.description || `Album by ${album.owner.display_name}`,
          image: album.images[0]?.url,
          owner: album.owner.display_name,
          trackCount: album.tracks.total,
          externalUrl: album.external_urls[parsedLink.platform] || album.external_urls.spotify,
          platform: parsedLink.platform
        };

        tracks = album.tracks.items
          .filter(item => item.track)
          .map(item => musicTrackToInternal(item.track));
      }
    }

    if (!metadata) {
      errorType = 'not_found';
      const errorMessage = PLATFORM_ERROR_MESSAGES[platform as keyof typeof PLATFORM_ERROR_MESSAGES]?.not_found || 'Could not fetch music data';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    success = true;
    const latency = Date.now() - startTime;

    // Log successful parse request
    console.log(JSON.stringify({
      type: 'music_parse_request',
      platform,
      success: true,
      latency,
      trackCount: tracks.length,
      url: url.substring(0, 100) // Log first 100 chars for privacy
    }));

    return NextResponse.json({
      success: true,
      parsedLink,
      metadata,
      tracks
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    errorType = 'internal_error';
    
    // Log failed parse request
    console.error(JSON.stringify({
      type: 'music_parse_request',
      platform,
      success: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType,
      url: request.url
    }));

    // Provide platform-specific error messages
    const errorMessage = PLATFORM_ERROR_MESSAGES[platform as keyof typeof PLATFORM_ERROR_MESSAGES]?.generic || 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
