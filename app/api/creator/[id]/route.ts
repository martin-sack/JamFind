import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = params.id;

    // Get user profile with creator stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        playlists: {
          include: {
            playlistItems: {
              include: {
                track: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        creatorBadges: {
          where: { isActive: true },
          orderBy: { awardedAt: 'desc' },
        },
        _count: {
          select: {
            playlists: true,
            uploadedTracks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Calculate creator statistics
    const totalSubmissions = user._count.playlists;
    const totalTracksUploaded = user._count.uploadedTracks;
    
    // Get recent challenge participation
    const recentChallenges = await prisma.challengeParticipant.findMany({
      where: { userId },
      include: {
        challenge: true,
        track: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    // Get tipping stats
    const tippingStats = await prisma.tippingTransaction.aggregate({
      where: { 
        toUserId: userId,
        status: 'completed',
      },
      _sum: {
        amountCents: true,
      },
      _count: {
        id: true,
      },
    });

    // Get weekly ranking performance
    const weeklyPerformance = await prisma.submissionStat.findMany({
      where: {
        track: {
          playlistItems: {
            some: {
              playlist: {
                userId,
              },
            },
          },
        },
      },
      include: {
        track: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { weekStartDate: 'desc' },
      take: 8,
    });

    // Format response
    const creatorProfile = {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      country: user.country,
      bio: user.bio,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
      isVerified: user.isVerified,
      stats: {
        totalSubmissions,
        totalTracksUploaded,
        totalTipsReceived: user.totalTipsReceived,
        totalTipsGiven: user.totalTipsGiven,
        streakCount: user.streakCount,
        totalTipAmount: tippingStats._sum.amountCents || 0,
        totalTipTransactions: tippingStats._count.id || 0,
      },
      badges: user.creatorBadges.map(badge => ({
        id: badge.id,
        type: badge.badgeType,
        awardedAt: badge.awardedAt,
        metadata: badge.metadataJSON ? JSON.parse(badge.metadataJSON) : {},
      })),
      recentPlaylists: user.playlists.map(playlist => ({
        id: playlist.id,
        title: playlist.title,
        weekStartDate: playlist.weekStartDate,
        weekEndDate: playlist.weekEndDate,
        moodTags: playlist.moodTags.split(',').map(tag => tag.trim()),
        trackCount: playlist.playlistItems.length,
        tracks: playlist.playlistItems.map(item => ({
          id: item.track.id,
          title: item.track.title,
          artist: item.track.artist.name,
          artworkUrl: item.track.artworkUrl,
        })),
      })),
      recentChallenges: recentChallenges.map(participation => ({
        id: participation.challenge.id,
        theme: participation.challenge.theme,
        weekStart: participation.challenge.weekStart,
        track: {
          id: participation.track.id,
          title: participation.track.title,
          artist: participation.track.artist.name,
          artworkUrl: participation.track.artworkUrl,
        },
        rank: participation.rank,
        pointsAwarded: participation.pointsAwarded,
        submittedAt: participation.submittedAt,
      })),
      weeklyPerformance: weeklyPerformance.map(stat => ({
        weekStartDate: stat.weekStartDate,
        track: {
          id: stat.track.id,
          title: stat.track.title,
          artist: stat.track.artist.name,
        },
        submitterCount: stat.submitterCount,
        uniqueCountries: stat.uniqueCountries,
        rank: stat.totalWeightedScore, // This would need actual ranking calculation
      })),
    };

    return NextResponse.json(creatorProfile);

  } catch (error) {
    console.error('Creator profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator profile' },
      { status: 500 }
    );
  }
}

// Update creator profile
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // Validate user can only update their own profile
    // In production, you'd check authentication here
    
    const allowedFields = ['bio', 'profileImage', 'coverImage', 'socialLinks'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'socialLinks') {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      handle: updatedUser.handle,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      coverImage: updatedUser.coverImage,
      socialLinks: updatedUser.socialLinks ? JSON.parse(updatedUser.socialLinks) : {},
    });

  } catch (error) {
    console.error('Update creator profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update creator profile' },
      { status: 500 }
    );
  }
}
