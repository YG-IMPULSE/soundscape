import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/tracks/[id]/recommendations
 * Get recommended tracks based on the given track
 * 
 * Uses collaborative filtering:
 * 1. Finds tracks in playlists that also contain this track
 * 2. Finds tracks liked by users who also liked this track
 * 3. Scores and ranks by frequency
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    // Token used for personalization in future (not yet implemented)
    // if (token) {
    //   const decoded = verifyToken(token);
    //   // Can use decoded.userId for personalized recommendations
    // }

    const trackId = params.id;

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        artist: true,
        genres: {
          include: {
            genre: true
          }
        }
      }
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Get track recommendations using multiple strategies
    interface RecommendedTrack {
      id: string;
      title: string;
      audioUrl: string;
      coverUrl: string | null;
      duration: number;
      artistId: string;
      artist: { id: string; name: string };
      genres: { genre: { id: string; name: string } }[];
    }
    const recommendations = new Map<string, { track: RecommendedTrack, score: number }>();

    // Strategy 1: Tracks from same playlists
    const playlistTracks = await prisma.playlistTrack.findMany({
      where: {
        playlist: {
          tracks: {
            some: {
              trackId: trackId
            }
          }
        },
        trackId: {
          not: trackId
        }
      },
      select: {
        trackId: true
      }
    });

    playlistTracks.forEach((pt) => {
      const existing = recommendations.get(pt.trackId);
      if (existing) {
        existing.score += 2; // Weight playlist co-occurrence
      } else {
        recommendations.set(pt.trackId, { track: null, score: 2 });
      }
    });

    // Strategy 2: Tracks liked by users who also liked this track
    const userLikes = await prisma.likedTrack.findMany({
      where: {
        user: {
          likedTracks: {
            some: {
              trackId: trackId
            }
          }
        },
        trackId: {
          not: trackId
        }
      },
      select: {
        trackId: true
      }
    });

    userLikes.forEach((like) => {
      const existing = recommendations.get(like.trackId);
      if (existing) {
        existing.score += 3; // Weight collaborative filtering higher
      } else {
        recommendations.set(like.trackId, { track: null, score: 3 });
      }
    });

    // Strategy 3: Tracks from same genre
    if (track.genres.length > 0) {
      const genreIds = track.genres.map(tg => tg.genreId);
      
      const genreTracks = await prisma.trackGenre.findMany({
        where: {
          genreId: {
            in: genreIds
          },
          trackId: {
            not: trackId
          }
        },
        select: {
          trackId: true
        },
        take: 20
      });

      genreTracks.forEach((gt) => {
        const existing = recommendations.get(gt.trackId);
        if (existing) {
          existing.score += 1; // Lower weight for genre similarity
        } else {
          recommendations.set(gt.trackId, { track: null, score: 1 });
        }
      });
    }

    // Strategy 4: Tracks from same artist
    const artistTracks = await prisma.track.findMany({
      where: {
        artistId: track.artistId,
        id: {
          not: trackId
        }
      },
      select: {
        id: true
      },
      take: 10
    });

    artistTracks.forEach((at) => {
      const existing = recommendations.get(at.id);
      if (existing) {
        existing.score += 1.5;
      } else {
        recommendations.set(at.id, { track: null, score: 1.5 });
      }
    });

    // Get track IDs sorted by score
    const sortedTrackIds = Array.from(recommendations.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 20)
      .map(([trackId]) => trackId);

    if (sortedTrackIds.length === 0) {
      // Fallback: return popular tracks
      const popularTracks = await prisma.track.findMany({
        where: {
          id: {
            not: trackId
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
          plays: 'desc'
        },
        take: 10
      });

      return NextResponse.json({
        tracks: popularTracks.map(t => ({
          ...t,
          genres: t.genres.map(tg => tg.genre)
        })),
        count: popularTracks.length,
        reason: 'Popular tracks'
      });
    }

    // Fetch full track details
    const recommendedTracks = await prisma.track.findMany({
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

    // Sort by original score order
    const sortedTracks = sortedTrackIds
      .map(id => recommendedTracks.find(t => t.id === id))
      .filter(Boolean)
      .map(track => ({
        ...track,
        genres: track!.genres.map((tg: { genre: { id: string; name: string } }) => tg.genre)
      }));

    return NextResponse.json({
      tracks: sortedTracks,
      count: sortedTracks.length,
      reason: 'Based on your listening habits'
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
