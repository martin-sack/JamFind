'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
    Spotify: {
      EmbedController: any;
      IframeController: {
        createController: (element: HTMLElement, options: any, callback: (controller: any) => void) => void;
      };
    };
  }
}

interface SpotifyEmbedPlayerProps {
  playlistUri?: string;
  trackUri?: string;
  width?: string | number;
  height?: string | number;
  onReady?: (controller: any) => void;
  onTrackChange?: (data: any) => void;
  onPlaybackUpdate?: (data: any) => void;
  customControls?: boolean;
  className?: string;
}

export default function SpotifyEmbedPlayer({
  playlistUri,
  trackUri,
  width = '100%',
  height = 352,
  onReady,
  onTrackChange,
  onPlaybackUpdate,
  customControls = false,
  className = ''
}: SpotifyEmbedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedControllerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  // Load Spotify iFrame API script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.Spotify?.EmbedController) {
      initializePlayer();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    
    window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      initializePlayer();
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializePlayer = useCallback(() => {
    if (!containerRef.current) return;

    const options = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      uri: playlistUri ? `spotify:playlist:${playlistUri}` : trackUri ? `spotify:track:${trackUri}` : undefined,
    };

    const callback = (EmbedController: any) => {
      embedControllerRef.current = EmbedController;

      // Set up event listeners
      EmbedController.addListener('ready', () => {
        setIsReady(true);
        onReady?.(EmbedController);
      });

      EmbedController.addListener('playback_update', (data: any) => {
        setIsPlaying(data.isPlaying);
        onPlaybackUpdate?.(data);
      });

      EmbedController.addListener('track_change', (data: any) => {
        setCurrentTrack(data);
        onTrackChange?.(data);
      });

      // Initialize the player
      EmbedController.loadUri(options.uri, {
        callback: (error: any) => {
          if (error) {
            console.error('Error loading Spotify URI:', error);
          }
        }
      });
    };

    // @ts-ignore - Spotify global is available after script loads
    window.Spotify.IframeController.createController(containerRef.current, options, callback);
  }, [playlistUri, trackUri, width, height, onReady, onPlaybackUpdate, onTrackChange]);

  // Update URI when props change
  useEffect(() => {
    if (embedControllerRef.current && isReady) {
      const uri = playlistUri ? `spotify:playlist:${playlistUri}` : trackUri ? `spotify:track:${trackUri}` : undefined;
      if (uri) {
        embedControllerRef.current.loadUri(uri, {
          callback: (error: any) => {
            if (error) {
              console.error('Error loading Spotify URI:', error);
            }
          }
        });
      }
    }
  }, [playlistUri, trackUri, isReady]);

  // Custom control functions
  const play = useCallback(() => {
    if (embedControllerRef.current && isReady) {
      embedControllerRef.current.togglePlay();
    }
  }, [isReady]);

  const pause = useCallback(() => {
    if (embedControllerRef.current && isReady) {
      embedControllerRef.current.togglePlay();
    }
  }, [isReady]);

  const next = useCallback(() => {
    if (embedControllerRef.current && isReady) {
      embedControllerRef.current.next();
    }
  }, [isReady]);

  const previous = useCallback(() => {
    if (embedControllerRef.current && isReady) {
      embedControllerRef.current.previous();
    }
  }, [isReady]);

  const seek = useCallback((positionMs: number) => {
    if (embedControllerRef.current && isReady) {
      embedControllerRef.current.seek(positionMs);
    }
  }, [isReady]);

  // Expose controls to parent via ref if needed
  useEffect(() => {
    if (onReady && embedControllerRef.current && isReady) {
      onReady({
        ...embedControllerRef.current,
        customControls: {
          play,
          pause,
          next,
          previous,
          seek,
        }
      });
    }
  }, [isReady, onReady, play, pause, next, previous, seek]);

  return (
    <div className={`spotify-embed-player ${className}`}>
      {/* Custom controls */}
      {customControls && isReady && (
        <div className="flex items-center justify-center gap-4 mb-4 p-4 bg-muted rounded-lg">
          <button
            onClick={previous}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button
            onClick={next}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Spotify embed container */}
      <div
        ref={containerRef}
        className="spotify-embed-container"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      />

      {/* Loading state */}
      {!isReady && (
        <div 
          className="flex items-center justify-center bg-muted rounded-lg"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading Spotify player...</p>
          </div>
        </div>
      )}
    </div>
  );
}
