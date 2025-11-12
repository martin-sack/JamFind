import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const quickCreateSchema = z.object({
  title: z.string().min(1).max(255),
  artistName: z.string().min(1).max(255),
  country: z.string().optional(),
  previewUrl: z.string().url().optional().or(z.literal('')),
  artworkUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = quickCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, artistName, country, previewUrl, artworkUrl } = validationResult.data;

    // Find or create artist
    let artist = await prisma.artist.findFirst({
      where: {
        name: artistName,
      },
    });

    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name: artistName,
          country: country || null,
          verified: false,
          aka: '',
          chartedWeeks: '',
        },
      });
    }

    // Check if track already exists (same title and artist)
    const existingTrack = await prisma.track.findFirst({
      where: {
        title: title,
        artistId: artist.id,
      },
      include: {
        artist: true,
      },
    });

    if (existingTrack) {
      return NextResponse.json({
        track: {
          id: existingTrack.id,
          title: existingTrack.title,
          artist: {
            id: existingTrack.artist.id,
            name: existingTrack.artist.name,
            country: existingTrack.artist.country,
          },
          previewUrl: existingTrack.previewUrl,
          artworkUrl: existingTrack.artworkUrl,
          country: existingTrack.country,
          visibility: existingTrack.visibility,
        },
        created: false,
      });
    }

    // Create new track
    const track = await prisma.track.create({
      data: {
        title,
        artistId: artist.id,
        country: country || null,
        previewUrl: previewUrl || null,
        artworkUrl: artworkUrl || null,
        genres: '',
        moods: '',
        visibility: 'PUBLIC',
        uploadedByUserId: userId,
      },
      include: {
        artist: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'TRACK_QUICK_CREATED',
        entity: 'TRACK',
        entityId: track.id,
        metadataJSON: JSON.stringify({
          title,
          artistName,
          country,
          previewUrl,
          artworkUrl,
        }),
      },
    });

    return NextResponse.json({
      track: {
        id: track.id,
        title: track.title,
        artist: {
          id: track.artist.id,
          name: track.artist.name,
          country: track.artist.country,
        },
        previewUrl: track.previewUrl,
        artworkUrl: track.artworkUrl,
        country: track.country,
        visibility: track.visibility,
      },
      created: true,
    });

  } catch (error) {
    console.error('Error quick-creating track:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
