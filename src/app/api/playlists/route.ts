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

    const playlists = await prisma.playlist.findMany({
      where: { userId: payload.userId },
      include: {
        _count: {
          select: { tracks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
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

    const { name, description, isPublic, isCollaborative } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'Playlist name is required' }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? false,
        isCollaborative: isCollaborative ?? false,
        userId: payload.userId,
      }
    })

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
