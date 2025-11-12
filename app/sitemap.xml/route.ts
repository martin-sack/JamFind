import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSitemapData } from '@/lib/seo'

export async function GET(request: NextRequest) {
  try {
    // Get all playlists and creators for sitemap
    const [playlists, creators] = await Promise.all([
      prisma.playlist.findMany({
        select: {
          id: true,
          updatedAt: true
        },
        where: {
          // Only include playlists that are public and have content
          title: { not: null }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          updatedAt: true
        },
        where: {
          // Only include users who are creators and have profiles
          role: 'CREATOR',
          name: { not: null }
        }
      })
    ])

    const sitemap = generateSitemapData({
      playlists,
      creators
    })

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate' // Cache for 24 hours
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    
    // Return a basic sitemap even if there's an error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jamfind.dev</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jamfind.dev/discover</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jamfind.dev/leaderboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}
