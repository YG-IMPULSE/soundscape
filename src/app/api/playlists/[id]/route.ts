import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Allow access if user owns playlist OR if playlist is public
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: payload.userId },
          { isPublic: true }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        tracks: {
          include: {
            track: {
              include: {
                artist: true,
                album: true
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        contributors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            tracks: true,
            contributors: true
          }
        }
      }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    // Transform to match TrackList component expectations
    const transformedPlaylist = {
      ...playlist,
      tracks: playlist.tracks.map(pt => pt.track)
    }

    return NextResponse.json(transformedPlaylist)
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { name, description, isPublic, isCollaborative } = body

    // Find playlist and verify ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    if (playlist.userId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Enforce: collaborative implies public
    let nextIsPublic = isPublic
    const nextIsCollaborative = isCollaborative

    if (nextIsCollaborative && !nextIsPublic) {
      nextIsPublic = true
    }

    // Update playlist
    const updated = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(nextIsPublic !== undefined && { isPublic: nextIsPublic }),
        ...(nextIsCollaborative !== undefined && { isCollaborative: nextIsCollaborative })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            tracks: true,
            contributors: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
