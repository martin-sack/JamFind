import { NextRequest, NextResponse } from 'next/server';
import { fetchMusicPlaylist } from '@/lib/musicapi';

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

    // Get platform from query parameter (default to spotify for backward compatibility)
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform') || 'spotify';

    const playlist = await fetchMusicPlaylist(playlistId, platform);

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error fetching music playlist:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Music API authentication failed. Please check your credentials.' },
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
