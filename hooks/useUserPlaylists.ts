import { useState, useEffect } from "react";

interface UserPlaylist {
  id: string;
  name: string;
  trackCount: number;
  isPublic: boolean;
  createdAt: string;
}

interface Track {
  id: string;
  platform: string;
  title: string;
  artist: { name: string };
}

export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/playlists/user', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    try {
      const response = await fetch('/api/playlists/add-external-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId,
          trackId: track.id.replace(`${track.platform}_`, ''),
          platform: track.platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add track to playlist');
      }

      // Refresh playlists to update track counts
      await fetchPlaylists();
      
      return await response.json();
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  };

  const createPlaylist = async (name: string, isPublic: boolean = true) => {
    try {
      const response = await fetch('/api/playlists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const newPlaylist = await response.json();
      setPlaylists(prev => [...prev, newPlaylist.playlist]);
      
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete playlist');
      }

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return {
    playlists,
    loading,
    error,
    addTrackToPlaylist,
    createPlaylist,
    deletePlaylist,
    refetch: fetchPlaylists,
  };
}