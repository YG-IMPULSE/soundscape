import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/artists/:id/follow
 * Toggle follow/unfollow for an artist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const artistId = params.id;

    // Verify artist exists
    const artist = await prisma.artist.findUnique({
      where: { id: artistId }
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existing = await prisma.userFollowsArtist.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId
        }
      }
    });

    if (existing) {
      // Unfollow
      await prisma.userFollowsArtist.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ 
        following: false,
        message: 'Artist unfollowed successfully'
      });
    } else {
      // Follow
      await prisma.userFollowsArtist.create({
        data: {
          userId,
          artistId
        }
      });
      return NextResponse.json({ 
        following: true,
        message: 'Artist followed successfully'
      });
    }

  } catch (error) {
    console.error('Error toggling artist follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/artists/:id/follow
 * Check if user is following an artist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    if (!token) {
      return NextResponse.json({ following: false });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ following: false });
    }

    const userId = decoded.userId;
    const artistId = params.id;

    const follow = await prisma.userFollowsArtist.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId
        }
      }
    });

    return NextResponse.json({ following: !!follow });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ following: false });
  }
}
