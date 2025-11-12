-- Add external music platform support to existing tables

-- Add platform and external tracking fields to Artist table
ALTER TABLE artists ADD COLUMN platform TEXT DEFAULT 'jamfind';
ALTER TABLE artists ADD COLUMN externalId TEXT;
ALTER TABLE artists ADD COLUMN externalUrl TEXT;

-- Add platform and external tracking fields to Track table  
ALTER TABLE tracks ADD COLUMN platform TEXT DEFAULT 'jamfind';
ALTER TABLE tracks ADD COLUMN externalId TEXT;
ALTER TABLE tracks ADD COLUMN externalUrl TEXT;
ALTER TABLE tracks ADD COLUMN streamUrl TEXT;
ALTER TABLE tracks ADD COLUMN genre TEXT;

-- Create indexes for external lookups
CREATE INDEX idx_artists_external ON artists(platform, externalId);
CREATE INDEX idx_tracks_external ON tracks(platform, externalId);

-- Create PlaylistTrack table to replace PlaylistItem for better external track support
CREATE TABLE playlist_tracks (
    id TEXT PRIMARY KEY,
    playlistId TEXT NOT NULL,
    trackId TEXT NOT NULL,
    position INTEGER NOT NULL,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_playlist_tracks_unique ON playlist_tracks(playlistId, trackId);
CREATE INDEX idx_playlist_tracks_position ON playlist_tracks(playlistId, position);