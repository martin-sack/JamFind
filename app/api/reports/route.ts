import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entityType, entityId, reason, description } = await request.json()

    if (!entityType || !entityId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate entity types
    const validEntityTypes = ['PLAYLIST', 'TRACK', 'USER', 'COMMENT']
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    }

    // Check if entity exists
    let entityExists = false
    switch (entityType) {
      case 'PLAYLIST':
        entityExists = !!(await prisma.playlist.findUnique({ where: { id: entityId } }))
        break
      case 'TRACK':
        entityExists = !!(await prisma.track.findUnique({ where: { id: entityId } }))
        break
      case 'USER':
        entityExists = !!(await prisma.user.findUnique({ where: { id: entityId } }))
        break
      // For comments, you would need to check if you have a comments table
    }

    if (!entityExists) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Create the report
    const report = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REPORT',
        entity: entityType,
        entityId,
        metadataJSON: JSON.stringify({
          reason,
          description: description || '',
          reportedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report submitted successfully. Our moderation team will review it shortly.'
    })
  } catch (error) {
    console.error('Report submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and moderators can view reports
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const reports = await prisma.auditLog.findMany({
      where: {
        action: 'REPORT',
        metadataJSON: {
          contains: `"status":"${status}"`
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })

    const total = await prisma.auditLog.count({
      where: {
        action: 'REPORT',
        metadataJSON: {
          contains: `"status":"${status}"`
        }
      }
    })

    return NextResponse.json({
      reports: reports.map(report => ({
        ...report,
        metadata: JSON.parse(report.metadataJSON)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
