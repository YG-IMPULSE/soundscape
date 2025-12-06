import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
      }
    })

    if (!track) {
      return NextResponse.json(
        { message: 'Track not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
