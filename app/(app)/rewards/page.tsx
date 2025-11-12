'use client';

import RewardsClient from './RewardsClient';
import AuthGate from 'components/AuthGate';

export default function RewardsPage() {
  // Mock rewards data since API endpoint may not be available
  const data = {
    totalPoints: 420,
    rewards: [
      {
        id: '1',
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        points: 50,
        reason: 'Perfect 10 submission',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        weekStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        points: 30,
        reason: 'Trending track bonus',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    latestBadges: ['Sharpshooter', 'Rising Star']
  };

  return (
    <AuthGate>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Rewards
            </h1>
            <p className="text-muted-foreground">
              Track your points, badges, and weekly achievements
            </p>
          </div>

          <RewardsClient initialData={data} />
        </div>
      </div>
    </AuthGate>
  );
}
