import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/tracks/:id/play
 * Log a track play when user listens past 30% threshold
 * Updates Track.plays, User.lastActiveAt, creates PlayHistory record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const trackId = params.id;

    // Parse request body
    const body = await request.json();
    const { playedDuration, totalDuration } = body;

    // Validate that user listened to at least 30% of the track
    const threshold = 0.3;
    const listenRatio = playedDuration / totalDuration;

    if (listenRatio < threshold) {
      return NextResponse.json(
        { 
          error: 'Play threshold not met',
          message: `Must listen to at least ${threshold * 100}% of the track`,
          listenRatio 
        },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Use transaction to ensure consistency
    await prisma.$transaction([
      // Increment track play count
      prisma.track.update({
        where: { id: trackId },
        data: { plays: { increment: 1 } }
      }),
      
      // Update user last active timestamp
      prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() }
      }),
      
      // Create play history record
      prisma.playHistory.create({
        data: {
          userId,
          trackId,
          playedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Play logged successfully',
      trackId,
      listenRatio
    });

  } catch (error) {
    console.error('Error logging track play:', error);
    return NextResponse.json(
      { error: 'Failed to log play' },
      { status: 500 }
    );
  }
}
