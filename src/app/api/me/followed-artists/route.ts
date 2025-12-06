import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/me/followed-artists
 * Get all artists the user is following
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

    // Fetch followed artists with artist details
    const follows = await prisma.userFollowsArtist.findMany({
      where: { userId },
      include: {
        artist: {
          include: {
            _count: {
              select: {
                tracks: true,
                albums: true,
                followers: true
              }
            }
          }
        }
      },
      orderBy: { followedAt: 'desc' }
    });

    const artists = follows.map(follow => ({
      ...follow.artist,
      followedAt: follow.followedAt,
      trackCount: follow.artist._count.tracks,
      albumCount: follow.artist._count.albums,
      followerCount: follow.artist._count.followers
    }));

    return NextResponse.json({
      artists,
      count: artists.length
    });

  } catch (error) {
    console.error('Error fetching followed artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followed artists' },
      { status: 500 }
    );
  }
}
