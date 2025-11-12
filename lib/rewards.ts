/**
 * Rewards engine for weekly track submissions
 */

import { PrismaClient } from '@prisma/client';
import { computeTopTracks, getRewardPointsForRank, isRewardEligibleRank } from './ranking';
import { getWeekBounds } from './weeks';

// Note: Prisma client will be updated after running migrations
const prisma = new PrismaClient();

export interface RewardsSummary {
  weekStart: Date;
  totalRewardsDistributed: number;
  totalPointsAwarded: number;
  topTracks: Array<{
    trackId: string;
    rank: number;
    points: number;
    userCount: number;
  }>;
  payoutId: string;
}

export interface ApplyRewardsResult {
  success: boolean;
  summary?: RewardsSummary;
  error?: string;
}

/**
 * Apply weekly rewards for a given week
 * @param weekStart - Start date of the week (Monday 00:00:00)
 * @returns Result with summary of rewards applied
 */
export async function applyWeeklyRewards(weekStart: Date): Promise<ApplyRewardsResult> {
  try {
    // Step 1: Check if rewards have already been paid for this week
    // @ts-ignore - Prisma client will be updated after migrations
    const existingPayout = await prisma.rewardsPayout.findUnique({
      where: { weekStart },
    });

    if (existingPayout) {
      return {
        success: false,
        error: `Rewards already paid out for week starting ${weekStart.toISOString()}`,
      };
    }

    // Step 2: Get week bounds
    const { start, end } = getWeekBounds(weekStart);

    // Step 3: Load submission data for the week with anti-gaming filters
    const submissions = await prisma.playlistItem.findMany({
      where: {
        playlist: {
          weekStartDate: start,
          weekEndDate: end,
          // Anti-gaming: exclude users created < 5 minutes before playlist creation
          user: {
            createdAt: {
              lte: new Date(new Date().getTime() - 5 * 60 * 1000), // 5 minutes ago
            },
          },
        },
      },
      include: {
        playlist: {
          include: {
            user: {
              select: {
                id: true,
                country: true,
                createdAt: true,
              },
            },
          },
        },
        track: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: {
        addedAt: 'asc',
      },
    });

    if (submissions.length === 0) {
      return {
        success: false,
        error: 'No submissions found for the specified week',
      };
    }

    // Step 4: Transform data for ranking computation
    const submissionData = submissions.map(submission => ({
      trackId: submission.trackId,
      userId: submission.playlist.userId,
      country: submission.playlist.user.country || undefined,
      submittedAt: submission.addedAt,
    }));

    // Step 5: Compute top tracks
    const topTracks = computeTopTracks(submissionData);

    // Step 6: Apply rewards in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // @ts-ignore - Prisma client will be updated after migrations
      const payout = await tx.rewardsPayout.create({
        data: {
          weekStart,
          notes: `Weekly rewards payout for ${start.toISOString()} - ${end.toISOString()}`,
        },
      });

      const rewardEntries: any[] = [];
      const userPointUpdates = new Map<string, number>();
      const artistChartUpdates = new Map<string, Date[]>();

      // Process top 3 tracks for rewards
      const winningTracks = topTracks.filter(track => isRewardEligibleRank(track.rank));
      
      for (const track of winningTracks) {
        const points = getRewardPointsForRank(track.rank);
        
        // Find all distinct users who submitted this track this week
        const trackSubmitters = new Set(
          submissions
            .filter(s => s.trackId === track.trackId)
            .map(s => s.playlist.userId)
        );

        // Award points to each user who submitted this track
        for (const userId of Array.from(trackSubmitters)) {
          const currentPoints = userPointUpdates.get(userId) || 0;
          userPointUpdates.set(userId, currentPoints + points);

          rewardEntries.push({
            userId,
            weekStart,
            points,
            reason: `Had #${track.rank} Track: ${submissions.find(s => s.trackId === track.trackId)?.track.title}`,
          });

          // Update artist's charted weeks
          const trackData = submissions.find(s => s.trackId === track.trackId);
          if (trackData) {
            const artistId = trackData.track.artistId;
            const currentWeeks = artistChartUpdates.get(artistId) || [];
            if (!currentWeeks.some(w => w.getTime() === weekStart.getTime())) {
              artistChartUpdates.set(artistId, [...currentWeeks, weekStart]);
            }
          }
        }
      }

      // Create reward records
      if (rewardEntries.length > 0) {
        // @ts-ignore - Prisma client will be updated after migrations
        await tx.reward.createMany({
          data: rewardEntries,
        });
      }

      // Update user points
      for (const [userId, points] of Array.from(userPointUpdates.entries())) {
        await tx.user.update({
          where: { id: userId },
          data: {
            // @ts-ignore - Prisma client will be updated after migrations
            points: {
              increment: points,
            },
          },
        });
      }

      // Update artist charted weeks
      for (const [artistId, chartedWeeks] of Array.from(artistChartUpdates.entries())) {
        await tx.artist.update({
          where: { id: artistId },
          data: {
            chartedWeeks: JSON.stringify(chartedWeeks.map(date => date.toISOString())),
          },
        });
      }

      // Create audit logs
      await tx.auditLog.createMany({
        data: Array.from(userPointUpdates.keys()).map(userId => ({
          userId,
          action: 'REWARDS_AWARDED',
          entity: 'REWARD',
          metadataJSON: JSON.stringify({
            weekStart: weekStart.toISOString(),
            totalPoints: userPointUpdates.get(userId),
            payoutId: payout.id,
          }),
        })),
      });

      const summary: RewardsSummary = {
        weekStart,
        totalRewardsDistributed: rewardEntries.length,
        totalPointsAwarded: Array.from(userPointUpdates.values()).reduce((sum, points) => sum + points, 0),
        topTracks: winningTracks.map(track => ({
          trackId: track.trackId,
          rank: track.rank,
          points: getRewardPointsForRank(track.rank),
          userCount: track.uniqueSubmitters,
        })),
        payoutId: payout.id,
      };

      return { payout, summary };
    });

    return {
      success: true,
      summary: result.summary,
    };

  } catch (error) {
    console.error('Error applying weekly rewards:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the default week to run rewards for (previous week)
 * @returns Start date of the previous week
 */
export function getDefaultRewardsWeek(): Date {
  const { start } = getWeekBounds();
  const previousWeek = new Date(start);
  previousWeek.setDate(start.getDate() - 7);
  return previousWeek;
}

/**
 * Check if rewards can be run for a week
 * @param weekStart - Week start date
 * @returns Object with canRun boolean and reason if not
 */
export async function canRunRewardsForWeek(weekStart: Date): Promise<{
  canRun: boolean;
  reason?: string;
}> {
  // @ts-ignore - Prisma client will be updated after migrations
  const existingPayout = await prisma.rewardsPayout.findUnique({
    where: { weekStart },
  });

  if (existingPayout) {
    return {
      canRun: false,
      reason: 'Rewards already paid out for this week',
    };
  }

  const { start, end } = getWeekBounds(weekStart);
  
  // Check if the week has ended
  if (end > new Date()) {
    return {
      canRun: false,
      reason: 'Week has not ended yet',
    };
  }

  // Check if there are any submissions for this week
  const submissionCount = await prisma.playlistItem.count({
    where: {
      playlist: {
        weekStartDate: start,
        weekEndDate: end,
      },
    },
  });

  if (submissionCount === 0) {
    return {
      canRun: false,
      reason: 'No submissions found for this week',
    };
  }

  return { canRun: true };
}
