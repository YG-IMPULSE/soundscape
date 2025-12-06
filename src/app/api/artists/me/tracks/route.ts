import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface TokenPayload {
  userId: string
  email: string
}

// GET /api/artists/me/tracks - Get artist's tracks with stats
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Find artist profile
    const artist = await prisma.artist.findFirst({
      where: { userId: decoded.userId }
    })

    if (!artist) {
      return Response.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Get all tracks by this artist with stats
    const tracks = await prisma.track.findMany({
      where: {
        artistId: artist.id
      },
      include: {
        album: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            playHistory: true,
            likedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate total plays across all tracks
    const totalPlays = tracks.reduce((sum, track) => sum + track._count.playHistory, 0)
    const totalLikes = tracks.reduce((sum, track) => sum + track._count.likedBy, 0)

    return Response.json({
      tracks: tracks.map(track => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        coverUrl: track.coverUrl,
        audioUrl: track.audioUrl,
        explicit: track.explicit,
        releaseYear: track.releaseYear,
        createdAt: track.createdAt,
        album: track.album,
        plays: track._count.playHistory,
        likes: track._count.likedBy
      })),
      stats: {
        totalTracks: tracks.length,
        totalPlays,
        totalLikes
      }
    })
  } catch (error) {
    console.error('Error fetching artist tracks:', error)
    return Response.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}
