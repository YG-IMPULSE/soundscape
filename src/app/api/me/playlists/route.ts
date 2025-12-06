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

    const playlists = await prisma.playlist.findMany({
      where: { userId: decoded.userId },
      include: {
        _count: {
          select: { tracks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching user playlists:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
