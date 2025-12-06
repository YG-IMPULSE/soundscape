import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // tracks, artists, playlists, all
    const sortBy = searchParams.get('sort') || 'relevance' // relevance, newest, popular, az

    if (!query.trim()) {
      return NextResponse.json({
        tracks: [],
        artists: [],
        playlists: [],
      })
    }

    // Build orderBy based on sortBy param
    const getOrderBy = (entityType: 'track' | 'artist' | 'playlist') => {
      switch (sortBy) {
        case 'newest':
          return { createdAt: 'desc' as const }
        case 'popular':
          return entityType === 'track' ? { plays: 'desc' as const } : { createdAt: 'desc' as const }
        case 'az':
          return entityType === 'track' 
            ? { title: 'asc' as const }
            : { name: 'asc' as const }
        default: // relevance - just use creation date for now
          return { createdAt: 'desc' as const }
      }
    }

    // Search tracks
    const tracks = (type === 'all' || type === 'tracks') ? await prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artist: { name: { contains: query } } },
        ]
      },
      include: {
        artist: true,
        album: true,
      },
      orderBy: getOrderBy('track'),
      take: type === 'tracks' ? 50 : 10,
    }) : []

    // Search artists
    const artists = (type === 'all' || type === 'artists') ? await prisma.artist.findMany({
      where: {
        name: { contains: query }
      },
      orderBy: getOrderBy('artist'),
      take: type === 'artists' ? 50 : 5,
    }) : []

    // Search playlists
    const playlists = (type === 'all' || type === 'playlists') ? await prisma.playlist.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            tracks: true,
          }
        }
      },
      orderBy: getOrderBy('playlist'),
      take: type === 'playlists' ? 50 : 5,
    }) : []

    return NextResponse.json({
      tracks,
      artists,
      playlists,
      query,
      type,
      sortBy,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Search failed', error: String(error) },
      { status: 500 }
    )
  }
}
