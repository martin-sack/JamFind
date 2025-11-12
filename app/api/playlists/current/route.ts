import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getWeekBounds } from '@/lib/weeks';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session (it's stored in token.sub)
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const { start, end } = getWeekBounds();

    // Find or create the current week's playlist for the user
    let playlist = await prisma.playlist.findFirst({
      where: {
        userId: userId,
        weekStartDate: start,
        weekEndDate: end,
      },
      include: {
        playlistItems: {
          include: {
            track: {
              include: {
                artist: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      // Create new playlist for the current week
      playlist = await prisma.playlist.create({
        data: {
          userId: userId,
          weekStartDate: start,
          weekEndDate: end,
          title: `Weekly Picks - ${start.toLocaleDateString()}`,
          moodTags: '',
        },
        include: {
          playlistItems: {
            include: {
              track: {
                include: {
                  artist: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'PLAYLIST_CREATED',
          entity: 'PLAYLIST',
          entityId: playlist.id,
          metadataJSON: JSON.stringify({
            weekStart: start.toISOString(),
            weekEnd: end.toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        weekStartDate: playlist.weekStartDate,
        weekEndDate: playlist.weekEndDate,
        title: playlist.title,
        items: playlist.playlistItems.map(item => ({
          id: item.id,
          trackId: item.trackId,
          position: item.position,
          track: {
            id: item.track.id,
            title: item.track.title,
            artist: {
              id: item.track.artist.id,
              name: item.track.artist.name,
              country: item.track.artist.country,
            },
            previewUrl: item.track.previewUrl,
            artworkUrl: item.track.artworkUrl,
            country: item.track.country,
          },
        })),
      },
    });

  } catch (error) {
    console.error('Error getting current playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session (it's stored in token.sub)
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const { start, end } = getWeekBounds();

    // Find or create the current week's playlist for the user
    let playlist = await prisma.playlist.findFirst({
      where: {
        userId: userId,
        weekStartDate: start,
        weekEndDate: end,
      },
      include: {
        playlistItems: {
          include: {
            track: {
              include: {
                artist: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      // Create new playlist for the current week
      playlist = await prisma.playlist.create({
        data: {
          userId: userId,
          weekStartDate: start,
          weekEndDate: end,
          title: `Weekly Picks - ${start.toLocaleDateString()}`,
          moodTags: '',
        },
        include: {
          playlistItems: {
            include: {
              track: {
                include: {
                  artist: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'PLAYLIST_CREATED',
          entity: 'PLAYLIST',
          entityId: playlist.id,
          metadataJSON: JSON.stringify({
            weekStart: start.toISOString(),
            weekEnd: end.toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        weekStartDate: playlist.weekStartDate,
        weekEndDate: playlist.weekEndDate,
        title: playlist.title,
        items: playlist.playlistItems.map(item => ({
          id: item.id,
          trackId: item.trackId,
          position: item.position,
          track: {
            id: item.track.id,
            title: item.track.title,
            artist: {
              id: item.track.artist.id,
              name: item.track.artist.name,
              country: item.track.artist.country,
            },
            previewUrl: item.track.previewUrl,
            artworkUrl: item.track.artworkUrl,
            country: item.track.country,
          },
        })),
      },
    });

  } catch (error) {
    console.error('Error getting current playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
