import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Get recently played tracks
    const recentlyPlayed = await prisma.playHistory.findMany({
      where: { userId: decoded.userId },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          }
        }
      },
      orderBy: { playedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(recentlyPlayed)
  } catch (error) {
    console.error('Error fetching recently played:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
