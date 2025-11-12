import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isWithinCurrentWeek } from '@/lib/weeks';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const addItemSchema = z.object({
  trackId: z.string().min(1),
  position: z.number().min(1).max(10),
});

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
    
    // Validate request body
    const body = await request.json();
    const validationResult = addItemSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { trackId, position } = validationResult.data;

    // Get playlist and verify ownership and current week
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: userId,
      },
      include: {
        playlistItems: {
          include: {
            track: true,
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
        { error: 'Cannot modify playlists from previous weeks' },
        { status: 400 }
      );
    }

    // Check if track already exists in playlist (duplicate prevention)
    const existingItem = playlist.playlistItems.find(item => item.trackId === trackId);
    if (existingItem) {
      return NextResponse.json(
        { error: 'Track already exists in playlist' },
        { status: 400 }
      );
    }

    // Check if position is already taken
    const positionTaken = playlist.playlistItems.find(item => item.position === position);
    
    // Check total items limit
    if (playlist.playlistItems.length >= 10 && !positionTaken) {
      return NextResponse.json(
        { error: 'Playlist already has 10 items' },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { artist: true },
    });

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // If position is taken, shift existing items
    if (positionTaken) {
      // Shift all items from this position onward
      const itemsToShift = playlist.playlistItems
        .filter(item => item.position >= position)
        .sort((a, b) => b.position - a.position); // Sort descending to avoid conflicts

      for (const item of itemsToShift) {
        await prisma.playlistItem.update({
          where: { id: item.id },
          data: { position: item.position + 1 },
        });
      }
    }

    // Create the new playlist item
    const newItem = await prisma.playlistItem.create({
      data: {
        playlistId,
        trackId,
        position,
      },
      include: {
        track: {
          include: {
            artist: true,
          },
        },
      },
    });

    // Get updated playlist items
    const updatedItems = await prisma.playlistItem.findMany({
      where: { playlistId },
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
    });

    // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PLAYLIST_ITEM_ADDED',
          entity: 'PLAYLIST_ITEM',
          entityId: newItem.id,
          metadataJSON: JSON.stringify({
            playlistId,
            trackId,
            position,
            trackTitle: track.title,
            artistName: track.artist.name,
          }),
        },
      });

    return NextResponse.json({
      success: true,
      item: {
        id: newItem.id,
        trackId: newItem.trackId,
        position: newItem.position,
        track: {
          id: newItem.track.id,
          title: newItem.track.title,
          artist: {
            id: newItem.track.artist.id,
            name: newItem.track.artist.name,
            country: newItem.track.artist.country,
          },
          previewUrl: newItem.track.previewUrl,
          artworkUrl: newItem.track.artworkUrl,
          country: newItem.track.country,
        },
      },
      items: updatedItems.map(item => ({
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
    });

  } catch (error) {
    console.error('Error adding playlist item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE method to remove items
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Get playlist and verify ownership
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: userId,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check if playlist is for current week
    if (!isWithinCurrentWeek(playlist.weekStartDate)) {
      return NextResponse.json(
        { error: 'Cannot modify playlists from previous weeks' },
        { status: 400 }
      );
    }

    // Delete the item
    await prisma.playlistItem.delete({
      where: {
        id: itemId,
        playlistId: playlistId,
      },
    });

    // Reorder remaining items to fill gaps
    const remainingItems = await prisma.playlistItem.findMany({
      where: { playlistId },
      orderBy: { position: 'asc' },
    });

    // Update positions to be sequential
    for (let i = 0; i < remainingItems.length; i++) {
      await prisma.playlistItem.update({
        where: { id: remainingItems[i].id },
        data: { position: i + 1 },
      });
    }

    // Get updated items
    const updatedItems = await prisma.playlistItem.findMany({
      where: { playlistId },
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
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'TRACK_REMOVED',
        entity: 'PLAYLIST_ITEM',
        entityId: itemId,
        metadataJSON: JSON.stringify({
          playlistId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      items: updatedItems.map(item => ({
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
    });

  } catch (error) {
    console.error('Error removing playlist item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
