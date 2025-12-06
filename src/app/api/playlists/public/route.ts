import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/playlists/public
 * Get all public playlists
 */
export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      where: {
        isPublic: true
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
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: 50
    });

    return NextResponse.json({
      playlists,
      count: playlists.length
    });

  } catch (error) {
    console.error('Error fetching public playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public playlists' },
      { status: 500 }
    );
  }
}
