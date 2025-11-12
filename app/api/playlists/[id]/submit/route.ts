import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isWithinCurrentWeek } from '@/lib/weeks';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const playlistId = params.id;

    // Get playlist and verify ownership
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: userId,
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
        user: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check if playlist is for current week
    if (!isWithinCurrentWeek(playlist.weekStartDate)) {
      return NextResponse.json(
        { error: 'Cannot submit playlists from previous weeks' },
        { status: 400 }
      );
    }

    // Anti-gaming: Check if user account is too new (< 5 minutes)
    const accountAge = Date.now() - new Date(playlist.user.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (accountAge < fiveMinutes) {
      return NextResponse.json(
        { 
          error: 'Account is too new to submit playlists',
          message: 'Please wait 5 minutes after account creation before submitting your weekly picks'
        },
        { status: 400 }
      );
    }

    // Check if playlist has exactly 10 unique items
    if (playlist.playlistItems.length !== 10) {
      return NextResponse.json(
        { error: 'Playlist must have exactly 10 tracks to submit' },
        { status: 400 }
      );
    }

    // Check for duplicates (shouldn't happen due to unique constraint, but double-check)
    const trackIds = playlist.playlistItems.map(item => item.trackId);
    const uniqueTrackIds = new Set(trackIds);
    if (uniqueTrackIds.size !== 10) {
      return NextResponse.json(
        { error: 'Playlist contains duplicate tracks' },
        { status: 400 }
      );
    }

    // Check if playlist is already submitted (no actual submission state, but we can check if it's complete)
    // For now, we'll just create an audit log to mark submission

    // Create submission audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'PLAYLIST_SUBMITTED',
        entity: 'PLAYLIST',
        entityId: playlistId,
        metadataJSON: JSON.stringify({
          trackCount: playlist.playlistItems.length,
          trackIds: playlist.playlistItems.map(item => item.trackId),
          positions: playlist.playlistItems.map(item => item.position),
        }),
      },
    });

    // Check for potential fraud signals (identical 10-packs)
    await checkForFraudSignals(playlistId, userId, trackIds);

    return NextResponse.json({
      success: true,
      message: 'Playlist submitted successfully! You are now eligible for weekly rewards.',
      playlist: {
        id: playlist.id,
        weekStartDate: playlist.weekStartDate,
        weekEndDate: playlist.weekEndDate,
        items: playlist.playlistItems.map(item => ({
          id: item.id,
          position: item.position,
          track: {
            id: item.track.id,
            title: item.track.title,
            artist: {
              id: item.track.artist.id,
              name: item.track.artist.name,
            },
            previewUrl: item.track.previewUrl,
            artworkUrl: item.track.artworkUrl,
          },
        })),
      },
    });

  } catch (error) {
    console.error('Error submitting playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check for potential fraud signals like identical 10-packs from new accounts
 */
async function checkForFraudSignals(playlistId: string, userId: string, trackIds: string[]) {
  try {
    // Get the current playlist's creation time
    const currentPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { createdAt: true },
    });

    if (!currentPlaylist) return;

    // Look for identical playlists created within 30 minutes by different users
    const thirtyMinutesAgo = new Date(currentPlaylist.createdAt.getTime() - 30 * 60 * 1000);
    
    const identicalPlaylists = await prisma.playlist.findMany({
      where: {
        id: { not: playlistId },
        createdAt: { gte: thirtyMinutesAgo },
        playlistItems: {
          every: {
            trackId: { in: trackIds },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        playlistItems: {
          select: {
            trackId: true,
          },
        },
      },
    });

    // Filter for exact matches (same 10 tracks)
    const exactMatches = identicalPlaylists.filter(playlist => {
      const otherTrackIds = playlist.playlistItems.map(item => item.trackId);
      return (
        otherTrackIds.length === 10 &&
        trackIds.every(trackId => otherTrackIds.includes(trackId))
      );
    });

    // If we find multiple identical playlists from accounts created around the same time
    if (exactMatches.length >= 2) {
      const newAccountMatches = exactMatches.filter(match => {
        const accountAge = currentPlaylist.createdAt.getTime() - new Date(match.user.createdAt).getTime();
        return accountAge < 60 * 60 * 1000; // Accounts created within 1 hour
      });

      if (newAccountMatches.length >= 2) {
        // Create fraud signal
        await prisma.fraudSignal.create({
          data: {
            userId: userId,
            reason: 'IDENTICAL_10_PACK_MULTIPLE_NEW_ACCOUNTS',
            score: 0.8,
        metadataJSON: JSON.stringify({
          playlistId,
          identicalPlaylistCount: newAccountMatches.length,
          matchingUserIds: newAccountMatches.map(match => match.user.id),
          trackIds,
        }),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking for fraud signals:', error);
    // Don't fail the submission if fraud check fails
  }
}
