import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyWeeklyRewards, getDefaultRewardsWeek, canRunRewardsForWeek } from '@/lib/rewards';
import { z } from 'zod';

const runRewardsSchema = z.object({
  weekStart: z.string().optional(), // ISO string
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

    // Check if user has admin/mod permissions
    // For now, we'll allow any authenticated user to run rewards for testing
    // In production, you would check: session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'
    
    // Validate request body
    const body = await request.json();
    const validationResult = runRewardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { weekStart } = validationResult.data;

    // Determine which week to run rewards for
    let targetWeekStart: Date;
    if (weekStart) {
      targetWeekStart = new Date(weekStart);
      if (isNaN(targetWeekStart.getTime())) {
        return NextResponse.json(
          { error: 'Invalid weekStart date format' },
          { status: 400 }
        );
      }
    } else {
      targetWeekStart = getDefaultRewardsWeek();
    }

    // Check if rewards can be run for this week
    const canRun = await canRunRewardsForWeek(targetWeekStart);
    if (!canRun.canRun) {
      return NextResponse.json(
        { error: `Cannot run rewards for this week: ${canRun.reason}` },
        { status: 400 }
      );
    }

    // Apply weekly rewards
    const result = await applyWeeklyRewards(targetWeekStart);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly rewards applied successfully',
      summary: result.summary,
    });

  } catch (error) {
    console.error('Error running rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
