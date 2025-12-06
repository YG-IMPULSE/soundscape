import { NextRequest } from 'next/server'
import { verifyAdmin, createUnauthorizedResponse } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (!adminCheck.isAdmin) {
    return createUnauthorizedResponse(adminCheck.error)
  }

  try {
    // Total users
    const totalUsers = await prisma.user.count()

    // Total streams (play history entries)
    const totalStreams = await prisma.playHistory.count()

    // Total tracks
    const totalTracks = await prisma.track.count()

    // Total artists
    const totalArtists = await prisma.artist.count()

    // Top 10 tracks by play count
    const topTracks = await prisma.track.findMany({
      take: 10,
      include: {
        artist: true,
        _count: {
          select: {
            playHistory: true,
            likedBy: true
          }
        }
      },
      orderBy: {
        playHistory: {
          _count: 'desc'
        }
      }
    })

    // Top 10 artists by total plays
    const artistsWithPlays = await prisma.artist.findMany({
      take: 10,
      include: {
        tracks: {
          include: {
            _count: {
              select: {
                playHistory: true
              }
            }
          }
        },
        _count: {
          select: {
            followers: true
          }
        }
      }
    })

    const topArtists = artistsWithPlays
      .map(artist => ({
        ...artist,
        totalPlays: artist.tracks.reduce((sum: number, track) => sum + track._count.playHistory, 0)
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10)

    // New signups by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newSignups = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Format signups by day
    const signupsByDay = newSignups.reduce((acc, item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += item._count.id
      return acc
    }, {} as Record<string, number>)

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Active users (users who played something in the last 7 days)
    const activeUsers = await prisma.user.count({
      where: {
        lastActiveAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Recent uploads (last 30 days)
    const recentUploads = await prisma.track.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    return Response.json({
      overview: {
        totalUsers,
        totalStreams,
        totalTracks,
        totalArtists,
        recentSignups,
        activeUsers,
        recentUploads
      },
      topTracks: topTracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        plays: track._count.playHistory,
        likes: track._count.likedBy,
        coverUrl: track.coverUrl
      })),
      topArtists: topArtists.map(artist => ({
        id: artist.id,
        name: artist.name,
        totalPlays: artist.totalPlays,
        followers: artist._count.followers,
        trackCount: artist.tracks.length,
        image: artist.image
      })),
      signupsByDay
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
