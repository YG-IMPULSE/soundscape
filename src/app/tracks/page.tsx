'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import TrackList from '@/components/tracks/TrackList'

interface Genre {
  id: string
  name: string
  slug: string
  _count: {
    tracks: number
  }
}

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  plays: number
  artist: {
    id: string
    name: string
  }
  album?: {
    id: string
    title: string
  } | null
  genres: {
    genre: {
      id: string
      name: string
      slug: string
    }
  }[]
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await apiClient.get<Genre[]>('/api/genres')
        setGenres(data)
      } catch (error) {
        console.error('Failed to fetch genres:', error)
      }
    }

    fetchGenres()
  }, [])

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true)
      try {
        const url = selectedGenre
          ? `/api/tracks?genre=${selectedGenre}`
          : '/api/tracks'
        const data = await apiClient.get<Track[]>(url)
        setTracks(data)
      } catch (error) {
        console.error('Failed to fetch tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [selectedGenre])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Tracks</h1>
          <p className="text-gray-400">Browse our music collection</p>
          
          {tracks.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Hover over a track and click the play button to start listening. Player appears at the bottom.</span>
            </div>
          )}
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Filter by Genre
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedGenre === null
                    ? 'bg-[#00d9ff] text-black'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.slug)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedGenre === genre.slug
                      ? 'bg-[#00d9ff] text-black'
                      : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {genre.name}
                  <span className="ml-2 text-xs opacity-70">
                    {genre._count.tracks}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading tracks...</div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedGenre ? 'No tracks found in this genre' : 'No tracks yet'}
            </h2>
            <p className="text-gray-400">
              {selectedGenre
                ? 'Try selecting a different genre'
                : 'Check back soon for new music!'}
            </p>
          </div>
        ) : (
          <TrackList tracks={tracks} />
        )}
      </div>
    </div>
  )
}
