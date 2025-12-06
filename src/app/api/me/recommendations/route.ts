import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/me/recommendations
 * Get personalized recommendations for the user
 * Based on their liked tracks and listening history
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get user's liked tracks
    const likedTracks = await prisma.likedTrack.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            genres: {
              include: {
                genre: true
              }
            }
          }
        }
      },
      take: 20,
      orderBy: {
        likedAt: 'desc'
      }
    });

    // Get user's most played genres
    const genreFrequency = new Map<string, number>();
    likedTracks.forEach(like => {
      like.track.genres.forEach(tg => {
        const count = genreFrequency.get(tg.genreId) || 0;
        genreFrequency.set(tg.genreId, count + 1);
      });
    });

    const topGenres = Array.from(genreFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genreId]) => genreId);

    // Get IDs of tracks user already interacted with
    const likedTrackIds = likedTracks.map(lt => lt.trackId);

    // Recommendation strategy: Tracks from favorite genres that user hasn't heard
    let recommendations = await prisma.track.findMany({
      where: {
        id: {
          notIn: likedTrackIds
        },
        genres: {
          some: {
            genreId: {
              in: topGenres
            }
          }
        }
      },
      include: {
        artist: true,
        album: true,
        genres: {
          include: {
            genre: true
          }
        }
      },
      orderBy: [
        { plays: 'desc' },
        { likeCount: 'desc' }
      ],
      take: 15
    });

    // If not enough recommendations, add popular tracks
    if (recommendations.length < 10) {
      const popular = await prisma.track.findMany({
        where: {
          id: {
            notIn: [...likedTrackIds, ...recommendations.map(r => r.id)]
          }
        },
        include: {
          artist: true,
          album: true,
          genres: {
            include: {
              genre: true
            }
          }
        },
        orderBy: [
          { plays: 'desc' },
          { likeCount: 'desc' }
        ],
        take: 10 - recommendations.length
      });

      recommendations = [...recommendations, ...popular];
    }

    const formattedTracks = recommendations.map(track => ({
      ...track,
      genres: track.genres.map(tg => tg.genre)
    }));

    return NextResponse.json({
      tracks: formattedTracks,
      count: formattedTracks.length,
      reason: 'Based on your favorite genres'
    });

  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
