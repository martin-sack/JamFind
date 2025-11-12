import { Metadata } from 'next'

// Base metadata for the site
export const baseMetadata: Metadata = {
  title: {
    default: 'JamFind - Discover and Share Music Playlists',
    template: '%s | JamFind'
  },
  description: 'Discover amazing music playlists, vote for your favorites, and share your own creations with the JamFind community.',
  keywords: ['music', 'playlists', 'discovery', 'spotify', 'apple music', 'community'],
  authors: [{ name: 'JamFind Team' }],
  creator: 'JamFind',
  publisher: 'JamFind',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jamfind.dev',
    siteName: 'JamFind',
    title: 'JamFind - Discover and Share Music Playlists',
    description: 'Discover amazing music playlists, vote for your favorites, and share your own creations.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JamFind - Music Playlist Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JamFind - Discover and Share Music Playlists',
    description: 'Discover amazing music playlists, vote for your favorites, and share your own creations.',
    images: ['/og-image.jpg'],
    creator: '@jamfind',
  },
  verification: {
    // Add verification codes here when available
    // google: 'verification-code',
    // yandex: 'verification-code',
    // yahoo: 'verification-code',
  },
}

// Generate dynamic OG image URL for playlists
export function generatePlaylistOGUrl(playlist: {
  title: string
  owner: string
  coverUrl?: string
  trackCount?: number
}): string {
  const params = new URLSearchParams({
    title: playlist.title,
    owner: playlist.owner,
    ...(playlist.coverUrl && { cover: playlist.coverUrl }),
    ...(playlist.trackCount && { tracks: playlist.trackCount.toString() })
  })
  
  return `/api/og/playlist?${params.toString()}`
}

// Generate dynamic OG image URL for creators
export function generateCreatorOGUrl(creator: {
  name: string
  bio?: string
  profileImage?: string
  playlistCount?: number
}): string {
  const params = new URLSearchParams({
    name: creator.name,
    ...(creator.bio && { bio: creator.bio.substring(0, 100) }),
    ...(creator.profileImage && { avatar: creator.profileImage }),
    ...(creator.playlistCount && { playlists: creator.playlistCount.toString() })
  })
  
  return `/api/og/creator?${params.toString()}`
}

// Generate playlist metadata
export function generatePlaylistMetadata(playlist: {
  id: string
  title: string
  owner: string
  description?: string
  coverUrl?: string
  trackCount?: number
  platform: string
}): Metadata {
  const description = playlist.description || `A ${playlist.trackCount || 'curated'} track playlist by ${playlist.owner} on ${playlist.platform}`
  
  return {
    title: playlist.title,
    description,
    openGraph: {
      title: playlist.title,
      description,
      type: 'music.playlist',
      url: `https://jamfind.dev/playlist/${playlist.id}`,
      images: [
        {
          url: generatePlaylistOGUrl(playlist),
          width: 1200,
          height: 630,
          alt: `Playlist: ${playlist.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: playlist.title,
      description,
      images: [generatePlaylistOGUrl(playlist)],
    },
    other: {
      'music:creator': playlist.owner,
      'music:album': playlist.title,
      'music:song:count': playlist.trackCount?.toString() || '0',
    },
  }
}

// Generate creator metadata
export function generateCreatorMetadata(creator: {
  id: string
  name: string
  bio?: string
  profileImage?: string
  playlistCount?: number
}): Metadata {
  const description = creator.bio || `${creator.name} is a music curator on JamFind with ${creator.playlistCount || 'several'} playlists.`
  
  return {
    title: `${creator.name} - JamFind Creator`,
    description,
    openGraph: {
      title: `${creator.name} - JamFind Creator`,
      description,
      type: 'profile',
      url: `https://jamfind.dev/creator/${creator.id}`,
      images: [
        {
          url: generateCreatorOGUrl(creator),
          width: 1200,
          height: 630,
          alt: `Creator: ${creator.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${creator.name} - JamFind Creator`,
      description,
      images: [generateCreatorOGUrl(creator)],
    },
  }
}

// Generate structured data for playlists (JSON-LD)
export function generatePlaylistStructuredData(playlist: {
  id: string
  title: string
  owner: string
  description?: string
  coverUrl?: string
  trackCount?: number
  platform: string
  tracks?: Array<{
    title: string
    artist: string
    duration?: string
  }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: playlist.title,
    description: playlist.description,
    creator: {
      '@type': 'Person',
      name: playlist.owner,
    },
    numTracks: playlist.trackCount,
    image: playlist.coverUrl,
    ...(playlist.tracks && {
      track: playlist.tracks.map((track, index) => ({
        '@type': 'MusicRecording',
        position: index + 1,
        name: track.title,
        byArtist: {
          '@type': 'MusicGroup',
          name: track.artist,
        },
        ...(track.duration && { duration: track.duration }),
      })),
    }),
  }
}

// Generate structured data for creator profiles
export function generateCreatorStructuredData(creator: {
  id: string
  name: string
  bio?: string
  profileImage?: string
  playlistCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: creator.name,
    description: creator.bio,
    image: creator.profileImage,
    ...(creator.playlistCount && {
      makesOffer: {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'CreativeWork',
          name: 'Music Playlists',
          description: `${creator.playlistCount} curated music playlists`,
        },
      },
    }),
  }
}

// Generate sitemap data
export function generateSitemapData(entities: {
  playlists: Array<{ id: string; updatedAt: Date }>
  creators: Array<{ id: string; updatedAt: Date }>
}) {
  const baseUrl = 'https://jamfind.dev'
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/discover</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/leaderboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${entities.creators.map(creator => `
  <url>
    <loc>${baseUrl}/creator/${creator.id}</loc>
    <lastmod>${creator.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('')}
  ${entities.playlists.map(playlist => `
  <url>
    <loc>${baseUrl}/playlist/${playlist.id}</loc>
    <lastmod>${playlist.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`
}

// Robots.txt content
export const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/

Sitemap: https://jamfind.dev/sitemap.xml

# Crawl delay for music APIs
User-agent: *
Crawl-delay: 10
`
