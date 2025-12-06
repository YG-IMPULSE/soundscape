import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/tracks/trending
 * Returns trending tracks based on recent play counts with time decay
 * Algorithm: More recent plays = higher weight
 */
export async function GET() {
  try {
    // Get plays from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch play history from last 30 days
    const recentPlays = await prisma.playHistory.findMany({
      where: {
        playedAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
            genres: {
              include: {
                genre: true
              }
            }
          }
        }
      },
      orderBy: {
        playedAt: 'desc'
      }
    });

    // Calculate trending scores with time decay
    interface TrackWithRelations {
      id: string;
      title: string;
      audioUrl: string;
      coverUrl: string | null;
      duration: number;
      artistId: string;
      artist: { id: string; name: string };
      genres: { genre: { id: string; name: string } }[];
    }
    const trackScores = new Map<string, { track: TrackWithRelations, score: number }>();
    const now = Date.now();

    recentPlays.forEach((play) => {
      const trackId = play.trackId;
      const daysAgo = (now - play.playedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      // Time decay: more recent = higher score
      // Score decreases exponentially over time
      const decayFactor = Math.exp(-daysAgo / 10); // Halves roughly every 7 days
      const score = decayFactor;

      if (trackScores.has(trackId)) {
        const existing = trackScores.get(trackId)!;
        existing.score += score;
      } else {
        trackScores.set(trackId, {
          track: play.track,
          score: score
        });
      }
    });

    // Sort by score and take top 20
    const trendingTracks = Array.from(trackScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ track }) => ({
        ...track,
        genres: track.genres.map((tg: { genre: { id: string; name: string } }) => tg.genre)
      }));

    return NextResponse.json({
      tracks: trendingTracks,
      count: trendingTracks.length
    });

  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tracks' },
      { status: 500 }
    );
  }
}
