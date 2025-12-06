import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

// Add collaborator
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 })
    }

    // Find playlist and verify ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    if (playlist.userId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden - Only owner can add collaborators' }, { status: 403 })
    }

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToAdd) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if already a collaborator
    const existing = await prisma.playlistContributor.findUnique({
      where: {
        playlistId_userId: {
          playlistId: params.id,
          userId: userId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ message: 'User is already a collaborator' }, { status: 400 })
    }

    // Add collaborator
    const collaborator = await prisma.playlistContributor.create({
      data: {
        playlistId: params.id,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(collaborator)
  } catch (error) {
    console.error('Error adding collaborator:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Remove collaborator
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 })
    }

    // Find playlist and verify ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id }
    })

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 })
    }

    if (playlist.userId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden - Only owner can remove collaborators' }, { status: 403 })
    }

    // Remove collaborator
    await prisma.playlistContributor.delete({
      where: {
        playlistId_userId: {
          playlistId: params.id,
          userId: userId
        }
      }
    })

    return NextResponse.json({ message: 'Collaborator removed successfully' })
  } catch (error) {
    console.error('Error removing collaborator:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
