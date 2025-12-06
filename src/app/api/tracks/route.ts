import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const artistId = searchParams.get('artistId')
    const genreSlug = searchParams.get('genre')

    // Build where clause
    const where: any = {}
    if (artistId) {
      where.artistId = artistId
    }
    if (genreSlug) {
      where.genres = {
        some: {
          genre: {
            slug: genreSlug,
          },
        },
      }
    }

    const tracks = await prisma.track.findMany({
      where,
      include: {
        artist: true,
        album: true,
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
