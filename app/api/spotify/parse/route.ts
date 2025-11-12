import { NextRequest, NextResponse } from 'next/server';
import { parsePlaylistLink, fetchSpotifyPlaylist, fetchSpotifyTrack, spotifyTrackToInternal } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const parsedLink = parsePlaylistLink(url);

    if (!parsedLink) {
      return NextResponse.json(
        { error: 'Invalid playlist URL or unsupported platform' },
        { status: 400 }
      );
    }

    let metadata = null;
    let tracks: any[] = [];

    // Handle Spotify playlists
    if (parsedLink.platform === 'spotify' && parsedLink.type === 'playlist') {
      const playlist = await fetchSpotifyPlaylist(parsedLink.id);
      
      if (playlist) {
        metadata = {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          image: playlist.images[0]?.url,
          owner: playlist.owner.display_name,
          trackCount: playlist.tracks.total,
          externalUrl: playlist.external_urls.spotify
        };

        // Convert tracks to internal format
        tracks = playlist.tracks.items
          .filter(item => item.track) // Filter out null tracks
          .map(item => spotifyTrackToInternal(item.track));
      }
    }
    // Handle Spotify tracks
    else if (parsedLink.platform === 'spotify' && parsedLink.type === 'track') {
      const track = await fetchSpotifyTrack(parsedLink.id);
      
      if (track) {
        metadata = {
          id: track.id,
          name: track.name,
          description: `Track by ${track.artists.map(a => a.name).join(', ')}`,
          image: track.album.images[0]?.url,
          owner: track.artists[0]?.name || 'Unknown Artist',
          trackCount: 1,
          externalUrl: track.external_urls.spotify
        };

        tracks = [spotifyTrackToInternal(track)];
      }
    }
    // Handle other platforms (placeholder for future implementation)
    else {
      return NextResponse.json(
        { 
          error: 'Platform not yet supported',
          platform: parsedLink.platform,
          type: parsedLink.type
        },
        { status: 501 }
      );
    }

    if (!metadata) {
      return NextResponse.json(
        { error: 'Could not fetch playlist data' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      parsedLink,
      metadata,
      tracks
    });

  } catch (error) {
    console.error('Error parsing playlist URL:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
