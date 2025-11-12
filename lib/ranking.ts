/**
 * Pure functions for computing track rankings based on submission data
 */

export interface SubmissionData {
  trackId: string;
  userId: string;
  country?: string;
  submittedAt: Date;
}

export interface TrackRank {
  trackId: string;
  submitterCount: number;
  uniqueSubmitters: number;
  uniqueCountries: number;
  earliestAppearance: Date;
  score: number;
  rank: number;
  velocity?: number; // For Rising ranking
  hotScore?: number; // For Hot ranking
}

export type RankingMode = 'hot' | 'rising' | 'all-time';

/**
 * Compute hot score with time decay (exponential decay over 24 hours)
 * @param submissionTime - When the submission was made
 * @param now - Current time
 * @returns Hot score between 0 and 1
 */
function computeHotScore(submissionTime: Date, now: Date = new Date()): number {
  const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);
  const halfLife = 12; // 12-hour half-life
  return Math.exp(-Math.log(2) * hoursDiff / halfLife);
}

/**
 * Compute velocity score based on submission patterns
 * @param submissions - All submissions for a track
 * @param timeWindowHours - Time window to analyze velocity (default 24 hours)
 * @returns Velocity score (submissions per hour in recent window)
 */
function computeVelocity(submissions: SubmissionData[], timeWindowHours: number = 24): number {
  if (submissions.length === 0) return 0;
  
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);
  
  const recentSubmissions = submissions.filter(s => s.submittedAt >= cutoffTime);
  const olderSubmissions = submissions.filter(s => s.submittedAt < cutoffTime);
  
  const recentCount = recentSubmissions.length;
  const olderCount = olderSubmissions.length;
  
  // Calculate velocity as recent submissions per hour
  const velocity = recentCount / timeWindowHours;
  
  // Boost velocity if there's significant growth
  if (olderCount > 0) {
    const growthRate = recentCount / olderCount;
    return velocity * Math.min(growthRate, 5); // Cap growth multiplier at 5x
  }
  
  return velocity;
}

/**
 * Compute top tracks with enhanced ranking modes
 * @param submissions - Array of submission data
 * @param mode - Ranking mode: 'hot', 'rising', or 'all-time'
 * @returns Array of ranked tracks (Top 100)
 */
export function computeTopTracks(
  submissions: SubmissionData[], 
  mode: RankingMode = 'all-time'
): TrackRank[] {
  if (submissions.length === 0) {
    return [];
  }

  const now = new Date();
  
  // Group submissions by trackId
  const trackGroups = new Map<string, SubmissionData[]>();
  
  for (const submission of submissions) {
    if (!trackGroups.has(submission.trackId)) {
      trackGroups.set(submission.trackId, []);
    }
    trackGroups.get(submission.trackId)!.push(submission);
  }

  // Calculate metrics for each track with ranking mode specific scores
  const trackRanks: TrackRank[] = [];
  
  for (const [trackId, trackSubmissions] of Array.from(trackGroups.entries())) {
    const submitterCount = trackSubmissions.length;
    const uniqueSubmitters = new Set(trackSubmissions.map((s: SubmissionData) => s.userId)).size;
    const uniqueCountries = new Set(
      trackSubmissions
        .map((s: SubmissionData) => s.country)
        .filter(Boolean) as string[]
    ).size;
    const earliestAppearance = new Date(
      Math.min(...trackSubmissions.map((s: SubmissionData) => s.submittedAt.getTime()))
    );

    let score = submitterCount;
    let velocity: number | undefined;
    let hotScore: number | undefined;

    // Apply ranking mode specific scoring
    switch (mode) {
      case 'hot':
        // Hot ranking: time-decay weighted score
        hotScore = trackSubmissions.reduce((sum, submission) => {
          return sum + computeHotScore(submission.submittedAt, now);
        }, 0);
        score = hotScore * submitterCount;
        break;
        
      case 'rising':
        // Rising ranking: velocity-based score
        velocity = computeVelocity(trackSubmissions);
        score = velocity * submitterCount;
        break;
        
      case 'all-time':
      default:
        // All-time ranking: classic popularity (default)
        score = submitterCount;
        break;
    }

    trackRanks.push({
      trackId,
      submitterCount,
      uniqueSubmitters,
      uniqueCountries,
      earliestAppearance,
      score,
      rank: 0, // Will be assigned after sorting
      velocity,
      hotScore,
    });
  }

  // Sort tracks according to ranking mode
  trackRanks.sort((a, b) => {
    // Primary: score (descending) - mode-specific score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // Tiebreakers (same for all modes)
    // First tiebreaker: uniqueSubmitters (descending)
    if (b.uniqueSubmitters !== a.uniqueSubmitters) {
      return b.uniqueSubmitters - a.uniqueSubmitters;
    }
    
    // Second tiebreaker: uniqueCountries (descending)
    if (b.uniqueCountries !== a.uniqueCountries) {
      return b.uniqueCountries - a.uniqueCountries;
    }
    
    // Final tiebreaker: earliestAppearance (ascending - earlier is better)
    return a.earliestAppearance.getTime() - b.earliestAppearance.getTime();
  });

  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < trackRanks.length; i++) {
    const track = trackRanks[i];
    
    // Check if this track has the same score as previous track (tie)
    if (i > 0 && track.score === trackRanks[i - 1].score) {
      track.rank = currentRank;
    } else {
      currentRank = i + 1;
      track.rank = currentRank;
    }
  }

  // Return top 100
  return trackRanks.slice(0, 100);
}

/**
 * Get the reward points for a given rank
 * @param rank - Track rank (1, 2, or 3)
 * @returns Points awarded for that rank
 */
export function getRewardPointsForRank(rank: number): number {
  switch (rank) {
    case 1:
      return 50;
    case 2:
      return 30;
    case 3:
      return 20;
    default:
      return 0;
  }
}

/**
 * Check if a rank is eligible for rewards
 * @param rank - Track rank
 * @returns boolean indicating if rank is eligible for rewards (1-3)
 */
export function isRewardEligibleRank(rank: number): boolean {
  return rank >= 1 && rank <= 3;
}
