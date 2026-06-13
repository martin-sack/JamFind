import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    // Get user with points and recent rewards
    // @ts-ignore - Prisma client will be updated after migrations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // @ts-ignore
        points: true,
        // @ts-ignore
        rewards: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20, // Last 20 rewards
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate latest badges based on rewards
    // @ts-ignore
    const latestBadges = calculateLatestBadges(user.rewards || []);

    return NextResponse.json({
      // @ts-ignore
      totalPoints: user.points || 0,
      // @ts-ignore
      rewards: (user.rewards || []).map((reward: any) => ({
        id: reward.id,
        weekStart: reward.weekStart,
        points: reward.points,
        reason: reward.reason,
        createdAt: reward.createdAt,
      })),
      latestBadges,
    });

  } catch (error) {
    console.error('Error getting user rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate latest badges based on reward history
 */
function calculateLatestBadges(rewards: any[]): string[] {
  const badges: string[] = [];

  // Check for recent #1 track rewards
  const recentTopTrackRewards = rewards
    .filter(reward => reward.reason.includes('#1 Track'))
    .slice(0, 3); // Last 3 #1 track rewards

  if (recentTopTrackRewards.length > 0) {
    badges.push('Had #1 Track');
    
    if (recentTopTrackRewards.length >= 3) {
      badges.push('Chart Dominator');
    }
  }

  // Check for multiple weeks of rewards
  const uniqueWeeks = new Set(rewards.map(reward => reward.weekStart.toISOString().split('T')[0]));
  if (uniqueWeeks.size >= 4) {
    badges.push('Weekly Regular');
  }

  // Check for consistent point earnings
  const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
  if (totalPoints >= 100) {
    badges.push('Point Collector');
  }

  // Check for early submissions (placeholder for future implementation)
  // This would require tracking when users submit their playlists

  return badges;
}
