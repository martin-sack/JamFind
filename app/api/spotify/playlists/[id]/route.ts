import { NextRequest, NextResponse } from 'next/server';
import { fetchSpotifyPlaylist } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    // Validate playlist ID format (Spotify IDs are 22 characters)
    if (playlistId.length !== 22) {
      return NextResponse.json(
        { error: 'Invalid playlist ID format' },
        { status: 400 }
      );
    }

    const playlist = await fetchSpotifyPlaylist(playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Spotify authentication failed. Please check your credentials.' },
        { status: 500 }
      );
    }
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
