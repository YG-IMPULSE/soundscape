'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePlayer } from '@/hooks/usePlayer'
import { Play, TrendingUp, Trophy } from 'lucide-react'

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  plays: number
  likeCount: number
  artist: {
    id: string
    name: string
  }
  album?: {
    id: string
    title: string
  } | null
  genres?: Array<{
    id: string
    name: string
    slug: string
  }>
  weekPlays?: number
}

export default function Home() {
  const { user } = useAuth()
  const { playTrack } = usePlayer()
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([])
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [newReleases, setNewReleases] = useState<Track[]>([])
  const [recommendedForYou, setRecommendedForYou] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

        const [trendingRes, topRes, releasesRes, recommendedRes] = await Promise.all([
          fetch('/api/tracks/trending'),
          fetch('/api/tracks/top-week'),
          fetch('/api/me/new-releases', { headers }),
          fetch('/api/me/recommendations', { headers })
        ])

        const trendingData = await trendingRes.json()
        const topData = await topRes.json()
        const releasesData = await releasesRes.json()
        const recommendedData = await recommendedRes.json()

        setTrendingTracks(trendingData.tracks || [])
        setTopTracks(topData.tracks || [])
        setNewReleases(releasesData.tracks || [])
        setRecommendedForYou(recommendedData.tracks || [])
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  const handlePlay = (track: Track) => {
    playTrack({
      id: track.id,
      title: track.title,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      artist: track.artist
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <h1 className="text-6xl font-bold text-white">
            Welcome to <span className="text-[#00d9ff]">Soundscape</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover, play, and enjoy millions of tracks on your ultimate music streaming platform.
          </p>
          
          {!user && (
            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/auth/register"
                className="bg-[#00d9ff] hover:bg-[#00c4e6] text-black px-8 py-3 rounded-full text-lg font-medium transition-colors font-semibold"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#00d9ff] px-8 py-3 rounded-full text-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {user && (
          <>
            {/* New Releases from Followed Artists */}
            {newReleases.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-8 h-8 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="text-3xl font-bold text-white">New from Artists You Follow</h2>
                </div>
                
                {loading ? (
                  <div className="text-gray-400">Loading new releases...</div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    {newReleases.map((track) => (
                      <div
                        key={track.id}
                        className="flex-shrink-0 w-[200px] bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-all group"
                      >
                        <div className="relative mb-3">
                          <Image
                            src={track.coverUrl || '/default-cover.jpg'}
                            alt={track.title}
                            width={168}
                            height={168}
                            className="rounded-md w-full aspect-square object-cover"
                          />
                          <button
                            onClick={() => handlePlay(track)}
                            className="absolute bottom-2 right-2 bg-[#00d9ff] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          >
                            <Play className="w-5 h-5 text-black fill-black" />
                          </button>
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate">{track.title}</h3>
                        <p className="text-gray-400 text-xs truncate">{track.artist.name}</p>
                        <p className="text-[#00d9ff] text-xs mt-1">New Release</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Trending Section */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-[#00d9ff]" />
                <h2 className="text-3xl font-bold text-white">Trending Now</h2>
              </div>
              
              {loading ? (
                <div className="text-gray-400">Loading trending tracks...</div>
              ) : trendingTracks.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No trending data yet. Start listening to build the charts!</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {trendingTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex-shrink-0 w-[200px] bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-all group"
                    >
                      <div className="relative mb-3">
                        <Image
                          src={track.coverUrl || '/default-cover.jpg'}
                          alt={track.title}
                          width={168}
                          height={168}
                          className="rounded-md w-full aspect-square object-cover"
                        />
                        <button
                          onClick={() => handlePlay(track)}
                          className="absolute bottom-2 right-2 bg-[#00d9ff] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        >
                          <Play className="w-5 h-5 text-black fill-black" />
                        </button>
                      </div>
                      <h3 className="text-white font-semibold text-sm truncate">{track.title}</h3>
                      <p className="text-gray-400 text-xs truncate">{track.artist.name}</p>
                      <p className="text-[#00d9ff] text-xs mt-1">{track.plays.toLocaleString()} plays</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top 10 This Week */}
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-[#00d9ff]" />
                <h2 className="text-3xl font-bold text-white">Top 10 This Week</h2>
              </div>
              
              {loading ? (
                <div className="text-gray-400">Loading top tracks...</div>
              ) : topTracks.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No top tracks this week. Be the first to listen!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {topTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-all group flex items-center gap-4"
                    >
                      <div className="text-3xl font-bold text-[#00d9ff] w-10 text-center">
                        {index + 1}
                      </div>
                      <div className="relative flex-shrink-0">
                        <Image
                          src={track.coverUrl || '/default-cover.jpg'}
                          alt={track.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-white font-semibold truncate">{track.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{track.artist.name}</p>
                        <p className="text-[#00d9ff] text-xs mt-1">
                          {track.weekPlays} plays this week
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlay(track)}
                        className="bg-[#00d9ff] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 flex-shrink-0"
                      >
                        <Play className="w-4 h-4 text-black fill-black" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended For You */}
            {recommendedForYou.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-8 h-8 text-[#00d9ff]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h2 className="text-3xl font-bold text-white">Recommended For You</h2>
                </div>
                
                {loading ? (
                  <div className="text-gray-400">Loading recommendations...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {recommendedForYou.slice(0, 10).map((track) => (
                      <div
                        key={track.id}
                        className="bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-all group"
                      >
                        <div className="relative mb-3">
                          <Image
                            src={track.coverUrl || '/default-cover.jpg'}
                            alt={track.title}
                            width={200}
                            height={200}
                            className="rounded-md w-full aspect-square object-cover"
                          />
                          <button
                            onClick={() => handlePlay(track)}
                            className="absolute bottom-2 right-2 bg-[#00d9ff] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          >
                            <Play className="w-5 h-5 text-black fill-black" />
                          </button>
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate">{track.title}</h3>
                        <p className="text-gray-400 text-xs truncate">{track.artist.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Link href="/tracks" className="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-colors">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2">Browse Tracks</h3>
                <p className="text-gray-400">
                  Explore our vast collection of music from various artists and genres.
                </p>
              </Link>

              <Link href="/artists" className="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-colors">
                <div className="text-4xl mb-4">🎤</div>
                <h3 className="text-xl font-bold text-white mb-2">Discover Artists</h3>
                <p className="text-gray-400">
                  Find your favorite artists and explore their entire discography.
                </p>
              </Link>

              <Link href="/playlists" className="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#2a2a2a] border border-gray-800 transition-colors">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">Create Playlists</h3>
                <p className="text-gray-400">
                  Organize your favorite music into custom playlists.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
