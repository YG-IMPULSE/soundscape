import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: true,
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: {
        releaseDate: 'desc',
      },
    })

    return NextResponse.json(albums)
  } catch (error) {
    console.error('Failed to fetch albums:', error)
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}
