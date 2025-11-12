import { prisma } from '@/lib/db';
import { Queue, Worker } from 'bullmq';
import { redis } from './redis';

// Use the configured Redis connection for BullMQ
const connection = redis;

// Queue for playlist refresh jobs
export const refreshQueue = new Queue('playlist-refresh', { connection });

// Worker for processing refresh jobs
export const refreshWorker = new Worker('playlist-refresh', async (job) => {
  const { playlistId, priority } = job.data;
  
  try {
    console.log(`Refreshing playlist ${playlistId} (priority: ${priority})`);
    
    // Get playlist with items
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        playlistItems: {
          include: {
            track: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new Error(`Playlist ${playlistId} not found`);
    }

    // Update last refreshed timestamp
    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Log refresh activity
    await prisma.auditLog.create({
      data: {
        userId: playlist.userId,
        action: 'PLAYLIST_REFRESHED',
        entity: 'PLAYLIST',
        entityId: playlistId,
        metadataJSON: JSON.stringify({
          priority,
          trackCount: playlist.playlistItems.length,
          refreshedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      playlistId,
      trackCount: playlist.playlistItems.length,
    };
  } catch (error) {
    console.error(`Failed to refresh playlist ${playlistId}:`, error);
    throw error;
  }
}, { connection });

// Function to schedule refresh for top N playlists
export async function scheduleTopPlaylistsRefresh(topN: number = 100) {
  try {
    // Get top N most-viewed/most-voted playlists
    // For now, we'll use most recently updated as a proxy
    const topPlaylists = await prisma.playlist.findMany({
      take: topN,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, userId: true },
    });

    console.log(`Scheduling refresh for ${topPlaylists.length} top playlists`);

    // Add jobs to queue with high priority
    const jobs = topPlaylists.map(playlist => ({
      name: 'refresh-playlist',
      data: { playlistId: playlist.id, priority: 'high' },
      opts: {
        delay: 0, // Process immediately
        priority: 1, // High priority
      },
    }));

    await refreshQueue.addBulk(jobs);

    return {
      scheduled: topPlaylists.length,
      type: 'top-playlists',
    };
  } catch (error) {
    console.error('Failed to schedule top playlists refresh:', error);
    throw error;
  }
}

// Function to schedule refresh for all other playlists
export async function scheduleAllPlaylistsRefresh() {
  try {
    // Get all playlists except the top N (already refreshed hourly)
    const allPlaylists = await prisma.playlist.findMany({
      select: { id: true, userId: true },
    });

    console.log(`Scheduling refresh for ${allPlaylists.length} playlists`);

    // Add jobs to queue with normal priority
    const jobs = allPlaylists.map(playlist => ({
      name: 'refresh-playlist',
      data: { playlistId: playlist.id, priority: 'normal' },
      opts: {
        delay: 0, // Process immediately
        priority: 5, // Normal priority
      },
    }));

    await refreshQueue.addBulk(jobs);

    return {
      scheduled: allPlaylists.length,
      type: 'all-playlists',
    };
  } catch (error) {
    console.error('Failed to schedule all playlists refresh:', error);
    throw error;
  }
}

// Function to get refresh status for a playlist
export async function getPlaylistRefreshStatus(playlistId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { updatedAt: true },
  });

  if (!playlist) {
    return null;
  }

  const now = new Date();
  const lastRefreshed = playlist.updatedAt;
  const hoursAgo = Math.floor((now.getTime() - lastRefreshed.getTime()) / (1000 * 60 * 60));

  return {
    lastRefreshed,
    hoursAgo,
    stale: hoursAgo > 3, // Consider stale if older than 3 hours
  };
}
