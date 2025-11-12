import { NextRequest, NextResponse } from 'next/server'
import { robotsTxt } from '@/lib/seo'

export async function GET(request: NextRequest) {
  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate' // Cache for 24 hours
    }
  })
}
