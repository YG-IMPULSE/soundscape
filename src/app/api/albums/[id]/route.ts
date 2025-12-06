import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Params {
  id: string
}

export async function GET(
  request: Request,
  context: { params: Promise<Params> | Params }
) {
  try {
    const params = await Promise.resolve(context.params)
    const { id } = params

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: {
          include: {
            artist: true,
            genres: {
              include: {
                genre: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error('Failed to fetch album:', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    )
  }
}
