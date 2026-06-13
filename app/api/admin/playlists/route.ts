import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build search query
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

    // Get playlists with pagination
    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
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
          _count: {
            select: {
              playlistItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.playlist.count({ where }),
    ]);

    return NextResponse.json({
      playlists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, playlistId, data } = await request.json();

    switch (action) {
      case 'soft-delete':
        // Soft delete playlist by updating title and adding deleted marker
        const deletedPlaylist = await prisma.playlist.update({
          where: { id: playlistId },
          data: {
            title: `[DELETED] ${data.reason || 'Admin action'}`,
          },
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: (session.user as any).id,
            action: 'PLAYLIST_SOFT_DELETED',
            entity: 'PLAYLIST',
            entityId: playlistId,
            metadataJSON: JSON.stringify({
              reason: data.reason,
              deletedBy: (session.user as any).id,
              deletedAt: new Date().toISOString(),
            }),
          },
        });

        return NextResponse.json({ success: true, playlist: deletedPlaylist });

      case 're-parse':
        // Re-parse playlist - this would trigger a refresh
        // For now, just log the action
        await prisma.auditLog.create({
          data: {
            userId: (session.user as any).id,
            action: 'PLAYLIST_REPARSE_REQUESTED',
            entity: 'PLAYLIST',
            entityId: playlistId,
            metadataJSON: JSON.stringify({
              requestedBy: (session.user as any).id,
              requestedAt: new Date().toISOString(),
            }),
          },
        });

        return NextResponse.json({ success: true, message: 'Re-parse requested' });

      case 'merge-duplicates':
        // Merge duplicate playlists logic would go here
        // For now, just log the action
        await prisma.auditLog.create({
          data: {
            userId: (session.user as any).id,
            action: 'PLAYLIST_MERGE_REQUESTED',
            entity: 'PLAYLIST',
            entityId: playlistId,
            metadataJSON: JSON.stringify({
              targetPlaylistId: data.targetPlaylistId,
              mergedBy: (session.user as any).id,
              mergedAt: new Date().toISOString(),
            }),
          },
        });

        return NextResponse.json({ success: true, message: 'Merge requested' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
