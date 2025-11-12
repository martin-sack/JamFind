# Unified Music API Integration for JamFind

This document describes the unified music API integration implementation for the JamFind platform, enabling seamless music playback and playlist management across multiple platforms without users leaving the site.

## Features Implemented

### 1. Unified Music API Integration
- **Multi-Platform Support**: Spotify, Apple Music, and YouTube playlist/track parsing
- **Playlist Metadata**: Fetch playlist name, description, images, owner, and track information
- **Track Data**: Get detailed track information including artists, album art, duration, and preview URLs
- **URL Parsing**: Parse Spotify, Apple Music, and YouTube playlist/track URLs
- **Search Functionality**: Search across multiple music platforms

### 2. Authentication Methods
- **ClientID Authentication**: Public endpoints using Token authentication
- **DevToken Authentication**: JWT tokens for user-specific data (future enhancement)
- **Client Secret Authentication**: Full access for backend services (secure use only)

### 3. User Experience
- **Link Submission**: Users can paste playlist URLs from multiple platforms
- **Playlist Preview**: Display playlist metadata and track listings
- **Multi-Platform Support**: Works with Spotify, Apple Music, and YouTube
- **Track Selection**: Click tracks to load them in the player

## Technical Architecture

### Components
- `MusicDemoPage`: Demo page for testing unified music API integration
- `SubmitClient`: Updated to use unified music API for URL parsing
- Future: Music player components for multi-platform playback

### API Routes
- `POST /api/music/parse`: Parse music URLs and fetch metadata across platforms
- `GET /api/music/playlists/[id]`: Fetch specific playlist data with platform support

### Utilities
- `lib/musicapi.ts`: Core unified music API integration
  - URL parsing for multiple platforms (Spotify, Apple Music, YouTube)
  - Authentication with ClientID token
  - Data transformation to internal formats
  - Multi-platform external URL support

## Setup Instructions

### 1. Unified Music API Configuration
The application is pre-configured with the provided Client ID:
- **Client ID**: `0a4cf0df-6e24-4edf-9803-0ae451c17e02`

### 2. Environment Configuration
Update your `.env.local` file:

```env
MUSIC_API_CLIENT_ID=0a4cf0df-6e24-4edf-9803-0ae451c17e02
```

### 3. Testing the Integration
1. Run the development server: `npm run dev`
2. Visit `http://localhost:3000/music-demo`
3. Try the example playlists or paste your own music URLs from:
   - Spotify: `https://open.spotify.com/playlist/...`
   - Apple Music: `https://music.apple.com/playlist/...`
   - YouTube: `https://youtube.com/playlist?list=...`

## Usage Examples

### Basic URL Parsing
```tsx
const response = await fetch('/api/music/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://open.spotify.com/playlist/...' })
});
const data = await response.json();
```

### Fetching Playlist Data
```tsx
const response = await fetch('/api/music/playlists/PLAYLIST_ID?platform=spotify');
const playlist = await response.json();
```

### Integration in Components
```tsx
// In SubmitClient component
const handleSearch = async (query: string) => {
  if (query.includes('spotify.com') || query.includes('music.apple.com') || query.includes('youtube.com')) {
    const response = await fetch('/api/music/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: query }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Handle parsed tracks
    }
  }
};
```

## API Reference

### Unified Music API Methods
- `parseMusicLink(url)`: Parse URLs from various platforms
- `fetchMusicPlaylist(id, platform)`: Get playlist data
- `fetchMusicTrack(id, platform)`: Get track data
- `searchMusicTracks(query)`: Search for tracks across platforms
- `musicTrackToInternal(track)`: Convert to internal format

### Response Formats

#### Parsed URL Response
```json
{
  "success": true,
  "parsedLink": {
    "platform": "spotify",
    "id": "PLAYLIST_ID",
    "type": "playlist",
    "url": "https://open.spotify.com/playlist/..."
  },
  "metadata": {
    "id": "PLAYLIST_ID",
    "name": "Playlist Name",
    "description": "Playlist description",
    "image": "https://image.url",
    "owner": "Owner Name",
    "trackCount": 10,
    "externalUrl": "https://platform.url",
    "platform": "spotify"
  },
  "tracks": [
    {
      "id": "TRACK_ID",
      "title": "Track Title",
      "artist": {
        "id": "ARTIST_ID",
        "name": "Artist Name"
      },
      "previewUrl": "https://preview.url",
      "artworkUrl": "https://artwork.url",
      "duration": 180000,
      "externalUrl": "https://platform.url/track/..."
    }
  ]
}
```

## Authentication Methods

### 1. ClientID Authentication (Current Implementation)
```javascript
// Header format
Authorization: Token 0a4cf0df-6e24-4edf-9803-0ae451c17e02
```

### 2. DevToken Authentication (Future Enhancement)
```javascript
// JWT format for user-specific data
Authorization: Bearer JWT_TOKEN
```

### 3. Client Secret Authentication (Secure Backend Only)
```javascript
// Basic auth format for full access
Authorization: Basic BASE64(CLIENT_ID:CLIENT_SECRET)
```

## Multi-Platform Support

### Supported Platforms
1. **Spotify**
   - Playlists: `https://open.spotify.com/playlist/ID`
   - Albums: `https://open.spotify.com/album/ID`
   - Tracks: `https://open.spotify.com/track/ID`

2. **Apple Music**
   - Playlists: `https://music.apple.com/playlist/ID`
   - Albums: `https://music.apple.com/album/ID`
   - Tracks: `https://music.apple.com/track/ID`

3. **YouTube**
   - Playlists: `https://youtube.com/playlist?list=ID`
   - Videos: `https://youtube.com/watch?v=ID`

## Migration from Spotify Integration

### Changes Made
1. **New API Client**: `lib/musicapi.ts` replaces `lib/spotify.ts`
2. **Updated Routes**: `/api/music/*` replaces `/api/spotify/*`
3. **Enhanced SubmitClient**: Now supports multi-platform URL parsing
4. **New Demo Page**: `/music-demo` for testing all platforms
5. **Environment Variables**: `MUSIC_API_CLIENT_ID` replaces Spotify credentials

### Backward Compatibility
- The new API maintains similar response formats
- Spotify-specific functionality is preserved
- Existing components work with minimal changes

## Security Considerations

1. **ClientID Security**: Client ID is safe for frontend use
2. **API Rate Limiting**: Implement caching to avoid hitting rate limits
3. **User Data**: For private playlists, implement DevToken authentication (future)
4. **Secure Storage**: Never expose Client Secret in frontend code

## Mobile Optimization

The implementation is mobile-first with:
- Responsive design for all components
- Touch-friendly controls
- Optimized loading states
- Mobile-appropriate UI components

## Future Enhancements

1. **DevToken Authentication**: OAuth-like flow for user-specific data
2. **Enhanced Search**: Unified search across all platforms
3. **Playback Integration**: Multi-platform music player
4. **Offline Mode**: Cache playlist data for better performance
5. **Analytics**: Track platform usage and user preferences

## Troubleshooting

### Common Issues

1. **"Invalid URL"**: Ensure the URL is from a supported platform
2. **"Authentication failed"**: Check Client ID configuration
3. **"Platform not supported"**: Verify URL format and platform support
4. **"No tracks found"**: Playlist may be private or unavailable

### Debug Mode
Enable console logging in components to debug API responses and parsing issues.

### Testing URLs
- Spotify: `https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF`
- Apple Music: `https://music.apple.com/playlist/pl.u-...`
- YouTube: `https://youtube.com/playlist?list=PL...`

## Performance Considerations

1. **Caching**: Implement response caching for frequently accessed playlists
2. **Batch Requests**: Combine multiple track requests when possible
3. **Lazy Loading**: Load track details only when needed
4. **Error Handling**: Graceful fallbacks for unavailable platforms
