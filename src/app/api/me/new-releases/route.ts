import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/me/new-releases
 * Get new tracks from artists the user follows
 * Returns tracks released in the last 30 days
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

    // Get artists user is following
    const followedArtists = await prisma.userFollowsArtist.findMany({
      where: { userId },
      select: { artistId: true }
    });

    const artistIds = followedArtists.map(f => f.artistId);

    if (artistIds.length === 0) {
      return NextResponse.json({
        tracks: [],
        count: 0
      });
    }

    // Get tracks from followed artists released in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newTracks = await prisma.track.findMany({
      where: {
        artistId: {
          in: artistIds
        },
        createdAt: {
          gte: thirtyDaysAgo
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    const formattedTracks = newTracks.map(track => ({
      ...track,
      genres: track.genres.map(tg => tg.genre)
    }));

    return NextResponse.json({
      tracks: formattedTracks,
      count: formattedTracks.length
    });

  } catch (error) {
    console.error('Error fetching new releases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new releases' },
      { status: 500 }
    );
  }
}
