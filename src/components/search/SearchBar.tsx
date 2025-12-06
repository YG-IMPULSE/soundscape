'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Track {
  id: string
  title: string
  coverUrl: string | null
  artist: {
    id: string
    name: string
  }
}

interface Artist {
  id: string
  name: string
  image: string | null
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

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    tracks: Track[]
    artists: Artist[]
    playlists: Playlist[]
  }>({ tracks: [], artists: [], playlists: [] })
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tracks: [], artists: [], playlists: [] })
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
  }

  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.playlists.length > 0

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tracks, artists, playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-[#1a1a1a] text-white rounded-full px-4 py-2 pl-10 pr-4 border border-gray-800 focus:border-[#00d9ff] focus:outline-none transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-2xl max-h-[70vh] overflow-y-auto z-50">
          {!isLoading && !hasResults && (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Tracks */}
          {results.tracks.length > 0 && (
            <div className="border-b border-gray-800">
              <div className="px-4 py-3 bg-[#0a0a0a] font-semibold text-white text-sm">
                Tracks
              </div>
              <div className="divide-y divide-gray-800">
                {results.tracks.map((track) => (
                  <Link
                    key={track.id}
                    href={`/tracks/${track.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors"
                  >
                    {track.coverUrl ? (
                      <Image
                        src={track.coverUrl}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xl">
                        🎵
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{track.title}</p>
                      <p className="text-gray-400 text-xs truncate">{track.artist.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Artists */}
          {results.artists.length > 0 && (
            <div className="border-b border-gray-800">
              <div className="px-4 py-3 bg-[#0a0a0a] font-semibold text-white text-sm">
                Artists
              </div>
              <div className="divide-y divide-gray-800">
                {results.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors"
                  >
                    {artist.image ? (
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                      <p className="text-gray-400 text-xs">Artist</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Playlists */}
          {results.playlists.length > 0 && (
            <div>
              <div className="px-4 py-3 bg-[#0a0a0a] font-semibold text-white text-sm">
                Playlists
              </div>
              <div className="divide-y divide-gray-800">
                {results.playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlists/${playlist.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00d9ff] to-[#0099ff] rounded flex items-center justify-center text-xl">
                      🎵
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-gray-400 text-xs truncate">
                        {playlist.user.name || 'User'} • {playlist._count.tracks} tracks
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View All Results Button */}
          {hasResults && (
            <button
              onClick={handleViewAll}
              className="w-full p-4 text-center text-[#00d9ff] hover:text-[#00c4e6] font-medium transition-colors border-t border-gray-800"
            >
              View all results for &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
