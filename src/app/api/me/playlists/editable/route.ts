import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

// Get all playlists that the user can edit (owned or collaborative)
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

    // Get playlists where user is owner OR is a collaborator on a collaborative playlist
    const editablePlaylists = await prisma.playlist.findMany({
      where: {
        OR: [
          { userId: payload.userId },
          {
            AND: [
              {
                contributors: {
                  some: { userId: payload.userId }
                }
              },
              { isCollaborative: true }
            ]
          }
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
        _count: {
          select: {
            tracks: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(editablePlaylists)
  } catch (error) {
    console.error('Error fetching editable playlists:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
