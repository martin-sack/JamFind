import { NextRequest, NextResponse } from 'next/server';
import { scheduleAllPlaylistsRefresh } from '@/lib/refresh';

export async function POST(request: NextRequest) {
  try {
    // Simple authentication for cron jobs (could be enhanced with API keys)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await scheduleAllPlaylistsRefresh();

    return NextResponse.json({
      success: true,
      message: `Scheduled refresh for ${result.scheduled} playlists`,
      result,
    });
  } catch (error) {
    console.error('Error scheduling all playlists refresh:', error);
    return NextResponse.json(
      { error: 'Failed to schedule refresh' },
      { status: 500 }
    );
  }
}
