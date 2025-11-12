# Spotify Integration for Playlist Warrior

This document describes the Spotify integration implementation for the Playlist Warrior platform, enabling seamless music playback and playlist management without users leaving the site.

## Features Implemented

### 1. Spotify Web API Integration
- **Playlist Metadata**: Fetch playlist name, description, images, owner, and track information
- **Track Data**: Get detailed track information including artists, album art, duration, and preview URLs
- **Search Functionality**: Search Spotify's catalog for tracks
- **URL Parsing**: Parse Spotify, Apple Music, and YouTube playlist URLs (Spotify fully implemented)

### 2. Spotify iFrame API Integration
- **Embedded Player**: Full-featured Spotify player embedded in the application
- **Custom Controls**: Programmatic control of playback (play, pause, next, previous, seek)
- **Event Handling**: Listen to player state changes, track changes, and ready events
- **Mobile Optimized**: Responsive design that works on all devices

### 3. User Experience
- **Link Submission**: Users can paste playlist URLs which are automatically parsed
- **Playlist Preview**: Display playlist metadata and track listings
- **Seamless Playback**: Music plays within the platform without redirects
- **Track Selection**: Click tracks to load them in the player

## Technical Architecture

### Components
- `SpotifyEmbedPlayer`: Main player component with custom controls
- `PlaylistMetadata`: Displays playlist information and track listings
- Demo page: `/spotify-demo` for testing the integration

### API Routes
- `POST /api/spotify/parse`: Parse playlist URLs and fetch metadata
- `GET /api/spotify/playlists/[id]`: Fetch specific playlist data

### Utilities
- `lib/spotify.ts`: Core Spotify Web API integration
  - URL parsing for multiple platforms
  - Authentication with client credentials flow
  - Data transformation to internal formats

## Setup Instructions

### 1. Spotify Developer Account
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the Client ID and Client Secret
4. Add `http://localhost:3000` to the app's redirect URIs (for future OAuth)

### 2. Environment Configuration
Update your `.env.local` file:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### 3. Testing the Integration
1. Run the development server: `npm run dev`
2. Visit `http://localhost:3000/spotify-demo`
3. Try the example playlists or paste your own Spotify URL

## Usage Examples

### Basic Player Integration
```tsx
import SpotifyEmbedPlayer from '@/components/SpotifyEmbedPlayer';

<SpotifyEmbedPlayer
  playlistUri="37i9dQZEVXbMDoHDwVN2tF"
  customControls={true}
  onReady={(controller) => console.log('Player ready!', controller)}
/>
```

### Parsing Playlist URLs
```tsx
const response = await fetch('/api/spotify/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://open.spotify.com/playlist/...' })
});
const data = await response.json();
```

### Displaying Playlist Metadata
```tsx
import PlaylistMetadata from '@/components/PlaylistMetadata';

<PlaylistMetadata
  playlistId="37i9dQZEVXbMDoHDwVN2tF"
  onTrackSelect={(track) => console.log('Track selected:', track)}
/>
```

## API Reference

### Spotify Web API Methods
- `parsePlaylistLink(url)`: Parse URLs from various platforms
- `fetchSpotifyPlaylist(id)`: Get playlist data
- `fetchSpotifyTrack(id)`: Get track data
- `searchSpotifyTracks(query)`: Search for tracks
- `spotifyTrackToInternal(track)`: Convert to internal format

### Player Controls
- `play()` / `pause()`: Toggle playback
- `next()` / `previous()`: Navigate tracks
- `seek(positionMs)`: Seek to position
- `loadUri(uri)`: Load new content

## Limitations & Considerations

### iFrame API Limitations
- **No Autoplay**: Users must interact with the player to start playback
- **Limited Track Control**: Cannot directly select tracks within playlists
- **Same-origin Policy**: Player must be visible and in the same domain

### Web API Limitations
- **Public Data Only**: Without user authentication, only public playlists are accessible
- **Rate Limits**: API calls are limited per application
- **Preview Tracks**: 30-second previews available for most tracks

## Security Considerations

1. **Client Credentials**: Store Spotify credentials securely in environment variables
2. **API Rate Limiting**: Implement caching to avoid hitting rate limits
3. **User Data**: For private playlists, implement OAuth flow (future enhancement)

## Mobile Optimization

The implementation is mobile-first with:
- Responsive player sizing
- Touch-friendly controls
- Optimized loading states
- Mobile-appropriate UI components

## Future Enhancements

1. **User Authentication**: OAuth flow for accessing private playlists
2. **Apple Music Integration**: Parse and display Apple Music content
3. **YouTube Integration**: Support for YouTube playlists
4. **Playlist Creation**: Allow users to create playlists from selected tracks
5. **Offline Mode**: Cache playlist data for better performance

## Troubleshooting

### Common Issues

1. **"Invalid playlist ID"**: Ensure the URL is a valid Spotify playlist/track URL
2. **"Authentication failed"**: Check Spotify credentials in environment variables
3. **Player not loading**: Ensure the iFrame API script loads properly
4. **No autoplay**: User interaction required to start playback (browser restriction)

### Debug Mode
Enable console logging in components to debug player events and API responses.
