import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/tracks/top-week
 * Returns top 10 most played tracks from the last 7 days
 */
export async function GET() {
  try {
    // Get plays from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch play history from last 7 days and group by track
    const recentPlays = await prisma.playHistory.findMany({
      where: {
        playedAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        trackId: true
      }
    });

    // Count plays per track
    const playCountMap = new Map<string, number>();
    recentPlays.forEach((play) => {
      const count = playCountMap.get(play.trackId) || 0;
      playCountMap.set(play.trackId, count + 1);
    });

    // Sort by play count
    const sortedTrackIds = Array.from(playCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([trackId]) => trackId);

    // Fetch full track details
    const topTracks = await prisma.track.findMany({
      where: {
        id: {
          in: sortedTrackIds
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
      }
    });

    // Sort by original order (play count DESC)
    const sortedTracks = sortedTrackIds
      .map(id => topTracks.find(t => t.id === id))
      .filter(Boolean)
      .map(track => ({
        ...track,
        genres: track!.genres.map((tg: { genre: { id: string; name: string } }) => tg.genre),
        weekPlays: playCountMap.get(track!.id) || 0
      }));

    return NextResponse.json({
      tracks: sortedTracks,
      count: sortedTracks.length,
      period: 'Last 7 days'
    });

  } catch (error) {
    console.error('Error fetching top tracks this week:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top tracks' },
      { status: 500 }
    );
  }
}
