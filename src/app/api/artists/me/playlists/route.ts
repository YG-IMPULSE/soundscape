import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface TokenPayload {
  userId: string
  email: string
}

// GET /api/artists/me/playlists - Get playlists that include artist's tracks
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Find artist profile
    const artist = await prisma.artist.findFirst({
      where: { userId: decoded.userId }
    })

    if (!artist) {
      return Response.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Find all playlists that contain tracks by this artist
    const playlistTracks = await prisma.playlistTrack.findMany({
      where: {
        track: {
          artistId: artist.id
        }
      },
      include: {
        playlist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                tracks: true
              }
            }
          }
        },
        track: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    })

    // Group by playlist and aggregate track info
    interface PlaylistInfo {
      id: string;
      name: string;
      isPublic: boolean;
      user: { id: string; name: string | null };
    }
    const playlistMap = new Map<string, {
      playlist: PlaylistInfo
      tracks: Array<{ id: string; title: string; addedAt: Date }>
    }>()

    playlistTracks.forEach(pt => {
      const playlistId = pt.playlist.id
      if (!playlistMap.has(playlistId)) {
        playlistMap.set(playlistId, {
          playlist: pt.playlist,
          tracks: []
        })
      }
      playlistMap.get(playlistId)!.tracks.push({
        id: pt.track.id,
        title: pt.track.title,
        addedAt: pt.addedAt
      })
    })

    const playlists = Array.from(playlistMap.values()).map(({ playlist, tracks }) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      coverImageUrl: playlist.coverImageUrl,
      isPublic: playlist.isPublic,
      owner: playlist.user,
      totalTracks: playlist._count.tracks,
      artistTracks: tracks,
      artistTrackCount: tracks.length
    }))

    return Response.json({
      playlists,
      totalPlaylists: playlists.length,
      totalInclusions: playlistTracks.length
    })
  } catch (error) {
    console.error('Error fetching artist playlists:', error)
    return Response.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}
