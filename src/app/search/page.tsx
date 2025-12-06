'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePlayer } from '@/hooks/usePlayer'

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  releaseYear?: number | null
  plays?: number
  artist: {
    id: string
    name: string
  }
  album: {
    id: string
    title: string
  } | null
}

interface Artist {
  id: string
  name: string
  image: string | null
  bio: string | null
}

interface Playlist {
  id: string
  name: string
  description: string | null
  user: {
    id: string
    name: string | null
  }
  _count: {
    tracks: number
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { playTrack } = usePlayer()
  
  const query = searchParams.get('q') || ''
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  
  const [results, setResults] = useState<{
    tracks: Track[]
    artists: Artist[]
    playlists: Playlist[]
  }>({ tracks: [], artists: [], playlists: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      router.push('/')
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=${type}&sort=${sortBy}`
        )
        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, type, sortBy, router])

  const updateURL = (newType?: string, newSort?: string) => {
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('type', newType || type)
    params.set('sort', newSort || sortBy)
    router.push(`/search?${params.toString()}`)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    updateURL(newType, sortBy)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    updateURL(type, newSort)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalResults = results.tracks.length + results.artists.length + results.playlists.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] pb-32">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Search Results
          </h1>
          <p className="text-gray-400">
            {isLoading ? 'Searching...' : `${totalResults} results for "${query}"`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleTypeChange('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                type === 'all'
                  ? 'bg-[#00d9ff] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange('tracks')}
              className={`px-4 py-2 rounded-full transition-colors ${
                type === 'tracks'
                  ? 'bg-[#00d9ff] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Tracks
            </button>
            <button
              onClick={() => handleTypeChange('artists')}
              className={`px-4 py-2 rounded-full transition-colors ${
                type === 'artists'
                  ? 'bg-[#00d9ff] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Artists
            </button>
            <button
              onClick={() => handleTypeChange('playlists')}
              className={`px-4 py-2 rounded-full transition-colors ${
                type === 'playlists'
                  ? 'bg-[#00d9ff] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Playlists
            </button>
          </div>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 rounded-full bg-[#1a1a1a] text-white border border-gray-800 focus:border-[#00d9ff] focus:outline-none cursor-pointer"
          >
            <option value="relevance">Most Relevant</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="az">A-Z</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && totalResults === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400">Try searching with different keywords</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <div className="space-y-12">
            {/* Tracks */}
            {results.tracks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Tracks</h2>
                <div className="space-y-2">
                  {results.tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group"
                    >
                      <button
                        onClick={() => playTrack({
                          id: track.id,
                          title: track.title,
                          audioUrl: track.audioUrl,
                          coverUrl: track.coverUrl,
                          artist: track.artist,
                        })}
                        className="w-12 h-12 flex items-center justify-center bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      
                      {track.coverUrl && (
                        <Image
                          src={track.coverUrl}
                          alt={track.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/tracks/${track.id}`} className="text-white font-medium hover:text-[#00d9ff] truncate block">
                          {track.title}
                        </Link>
                        <Link href={`/artists/${track.artist.id}`} className="text-gray-400 text-sm hover:text-white truncate block">
                          {track.artist.name}
                        </Link>
                      </div>
                      
                      {track.album && (
                        <Link href={`/albums/${track.album.id}`} className="hidden lg:block text-gray-400 text-sm hover:text-white truncate max-w-xs">
                          {track.album.title}
                        </Link>
                      )}
                      
                      <span className="text-gray-500 text-sm">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {results.artists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.artists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.id}`}
                      className="bg-[#1a1a1a] rounded-lg p-6 hover:bg-[#2a2a2a] transition-all group text-center"
                    >
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        {artist.image ? (
                          <Image
                            src={artist.image}
                            alt={artist.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-5xl">
                            👤
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white truncate group-hover:text-[#00d9ff] transition-colors">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-gray-400">Artist</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {results.playlists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Playlists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.playlists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.id}`}
                      className="bg-[#1a1a1a] rounded-lg p-6 hover:bg-[#2a2a2a] transition-all group"
                    >
                      <div className="w-full aspect-square bg-gradient-to-br from-[#00d9ff] to-[#0099ff] rounded-lg mb-4 flex items-center justify-center text-5xl">
                        🎵
                      </div>
                      <h3 className="font-semibold text-white truncate group-hover:text-[#00d9ff] transition-colors mb-1">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {playlist.user.name || 'User'} • {playlist._count.tracks} tracks
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
