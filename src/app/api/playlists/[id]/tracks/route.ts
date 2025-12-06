import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

// Add track to playlist
export async function POST(
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
    const { trackId } = body

    if (!trackId) {
      return NextResponse.json({ message: 'trackId is required' }, { status: 400 })
    }

    // Get playlist with contributors
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        contributors: true
      }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    // Check edit permissions
    const isOwner = playlist.userId === payload.userId
    const isCollaborator = playlist.contributors.some(
      (c: { userId: string }) => c.userId === payload.userId
    )

    const canEdit = isOwner || (playlist.isCollaborative && isCollaborator)

    if (!canEdit) {
      return NextResponse.json({ 
        message: 'Forbidden - You do not have permission to edit this playlist' 
      }, { status: 403 })
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    })

    if (!track) {
      return NextResponse.json({ message: 'Track not found' }, { status: 404 })
    }

    // Check if track is already in playlist
    const existingTrack = await prisma.playlistTrack.findFirst({
      where: {
        playlistId: params.id,
        trackId: trackId
      }
    })

    if (existingTrack) {
      return NextResponse.json({ message: 'Track already in playlist' }, { status: 400 })
    }

    // Get the highest position
    const lastTrack = await prisma.playlistTrack.findFirst({
      where: { playlistId: params.id },
      orderBy: { position: 'desc' }
    })

    const newPosition = lastTrack ? lastTrack.position + 1 : 0

    // Add track to playlist
    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId: params.id,
        trackId: trackId,
        position: newPosition
      },
      include: {
        track: {
          include: {
            artist: true,
            album: true
          }
        }
      }
    })

    return NextResponse.json(playlistTrack)
  } catch (error) {
    console.error('Error adding track to playlist:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Remove track from playlist
export async function DELETE(
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
    const { trackId } = body

    if (!trackId) {
      return NextResponse.json({ message: 'trackId is required' }, { status: 400 })
    }

    // Get playlist with contributors
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        contributors: true
      }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    // Check edit permissions
    const isOwner = playlist.userId === payload.userId
    const isCollaborator = playlist.contributors.some(
      (c: { userId: string }) => c.userId === payload.userId
    )

    const canEdit = isOwner || (playlist.isCollaborative && isCollaborator)

    if (!canEdit) {
      return NextResponse.json({ 
        message: 'Forbidden - You do not have permission to edit this playlist' 
      }, { status: 403 })
    }

    // Remove track from playlist
    await prisma.playlistTrack.deleteMany({
      where: {
        playlistId: params.id,
        trackId: trackId
      }
    })

    return NextResponse.json({ message: 'Track removed from playlist successfully' })
  } catch (error) {
    console.error('Error removing track from playlist:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
