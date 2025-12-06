import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * PATCH /api/playlists/[id]/settings
 * Update playlist privacy and collaborative settings
 */
export async function PATCH(
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

    const playlistId = params.id;
    const { isPublic, isCollaborative } = await request.json();

    // Verify playlist exists and user is the owner
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Only playlist owner can change settings' },
        { status: 403 }
      );
    }

    // Update playlist settings
    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...(typeof isPublic === 'boolean' && { isPublic }),
        ...(typeof isCollaborative === 'boolean' && { isCollaborative })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            tracks: true,
            contributors: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      playlist: updated
    });

  } catch (error) {
    console.error('Error updating playlist settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
