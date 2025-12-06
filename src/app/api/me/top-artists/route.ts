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

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'all' // week, month, all

    // Calculate date filter
    const now = new Date()
    let startDate: Date | undefined
    if (timeframe === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeframe === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get play history
    const playHistory = await prisma.playHistory.findMany({
      where: {
        userId: decoded.userId,
        ...(startDate && { playedAt: { gte: startDate } })
      },
      include: {
        track: {
          include: {
            artist: true
          }
        }
      }
    })

    // Count plays per artist
    const artistPlayCounts = playHistory.reduce((acc, play) => {
      const artistId = play.track.artistId
      if (!acc[artistId]) {
        acc[artistId] = {
          artist: play.track.artist,
          playCount: 0
        }
      }
      acc[artistId].playCount++
      return acc
    }, {} as Record<string, { artist: { id: string; name: string; image: string | null }; playCount: number }>)

    // Convert to array and sort
    const topArtists = Object.values(artistPlayCounts)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10)

    return NextResponse.json(topArtists)
  } catch (error) {
    console.error('Error fetching top artists:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
