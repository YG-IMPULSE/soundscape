import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const likedTracks = await prisma.likedTrack.findMany({
      where: { userId: payload.userId },
      include: {
        track: {
          include: {
            artist: true,
            album: true
          }
        }
      },
      orderBy: { likedAt: 'desc' }
    })

    // Return in the format expected by frontend
    return NextResponse.json({
      tracks: likedTracks.map(lt => lt.track)
    })
  } catch (error) {
    console.error('Error fetching liked tracks:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { trackId } = await request.json()

    if (!trackId) {
      return NextResponse.json({ message: 'Track ID is required' }, { status: 400 })
    }

    // Check if already liked
    const existing = await prisma.likedTrack.findUnique({
      where: {
        userId_trackId: {
          userId: payload.userId,
          trackId
        }
      }
    })

    if (existing) {
      // Unlike - delete record and decrement likeCount
      await prisma.$transaction([
        prisma.likedTrack.delete({
          where: { id: existing.id }
        }),
        prisma.track.update({
          where: { id: trackId },
          data: { likeCount: { decrement: 1 } }
        })
      ])
      return NextResponse.json({ liked: false })
    } else {
      // Like - create record and increment likeCount
      await prisma.$transaction([
        prisma.likedTrack.create({
          data: {
            userId: payload.userId,
            trackId
          }
        }),
        prisma.track.update({
          where: { id: trackId },
          data: { likeCount: { increment: 1 } }
        })
      ])
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
