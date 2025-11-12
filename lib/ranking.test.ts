import { describe, it, expect } from 'vitest';
import { computeTopTracks, getRewardPointsForRank, isRewardEligibleRank } from './ranking';

describe('Ranking Utilities', () => {
  describe('computeTopTracks', () => {
    it('should return empty array for no submissions', () => {
      const result = computeTopTracks([]);
      expect(result).toEqual([]);
    });

    it('should rank tracks by submitter count', () => {
      const submissions = [
        { trackId: '1', userId: 'user1', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '1', userId: 'user2', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '2', userId: 'user3', country: 'UK', submittedAt: new Date('2024-01-01') },
      ];

      const result = computeTopTracks(submissions);
      expect(result).toHaveLength(2);
      expect(result[0].trackId).toBe('1');
      expect(result[0].submitterCount).toBe(2);
      expect(result[1].trackId).toBe('2');
      expect(result[1].submitterCount).toBe(1);
    });

    it('should break ties with unique submitters', () => {
      const submissions = [
        { trackId: '1', userId: 'user1', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '1', userId: 'user1', country: 'US', submittedAt: new Date('2024-01-01') }, // Duplicate user
        { trackId: '2', userId: 'user2', country: 'UK', submittedAt: new Date('2024-01-01') },
        { trackId: '2', userId: 'user3', country: 'UK', submittedAt: new Date('2024-01-01') },
      ];

      const result = computeTopTracks(submissions);
      expect(result[0].trackId).toBe('2'); // More unique submitters
      expect(result[0].uniqueSubmitters).toBe(2);
      expect(result[1].trackId).toBe('1');
      expect(result[1].uniqueSubmitters).toBe(1);
    });

    it('should break ties with unique countries', () => {
      const submissions = [
        { trackId: '1', userId: 'user1', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '1', userId: 'user2', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '2', userId: 'user3', country: 'US', submittedAt: new Date('2024-01-01') },
        { trackId: '2', userId: 'user4', country: 'UK', submittedAt: new Date('2024-01-01') },
      ];

      const result = computeTopTracks(submissions);
      expect(result[0].trackId).toBe('2'); // More unique countries
      expect(result[0].uniqueCountries).toBe(2);
      expect(result[1].trackId).toBe('1');
      expect(result[1].uniqueCountries).toBe(1);
    });

    it('should break ties with earliest appearance', () => {
      const submissions = [
        { trackId: '1', userId: 'user1', country: 'US', submittedAt: new Date('2024-01-02') },
        { trackId: '2', userId: 'user2', country: 'US', submittedAt: new Date('2024-01-01') },
      ];

      const result = computeTopTracks(submissions);
      expect(result[0].trackId).toBe('2'); // Earlier submission
      expect(result[1].trackId).toBe('1');
    });

    it('should limit to top 100 tracks', () => {
      const submissions = Array.from({ length: 150 }, (_, i) => ({
        trackId: `track-${i}`,
        userId: `user-${i}`,
        country: 'US',
        submittedAt: new Date('2024-01-01'),
      }));

      const result = computeTopTracks(submissions);
      expect(result).toHaveLength(100);
    });
  });

  describe('getRewardPointsForRank', () => {
    it('should return correct points for rank 1', () => {
      expect(getRewardPointsForRank(1)).toBe(50);
    });

    it('should return correct points for rank 2', () => {
      expect(getRewardPointsForRank(2)).toBe(30);
    });

    it('should return correct points for rank 3', () => {
      expect(getRewardPointsForRank(3)).toBe(20);
    });

    it('should return 0 for ranks outside 1-3', () => {
      expect(getRewardPointsForRank(4)).toBe(0);
      expect(getRewardPointsForRank(0)).toBe(0);
      expect(getRewardPointsForRank(100)).toBe(0);
    });
  });

  describe('isRewardEligibleRank', () => {
    it('should return true for ranks 1-3', () => {
      expect(isRewardEligibleRank(1)).toBe(true);
      expect(isRewardEligibleRank(2)).toBe(true);
      expect(isRewardEligibleRank(3)).toBe(true);
    });

    it('should return false for ranks outside 1-3', () => {
      expect(isRewardEligibleRank(0)).toBe(false);
      expect(isRewardEligibleRank(4)).toBe(false);
      expect(isRewardEligibleRank(100)).toBe(false);
    });
  });
});
