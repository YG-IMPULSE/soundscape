'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

interface Album {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  releaseDate?: string | null
  artist: {
    id: string
    name: string
  }
  _count: {
    tracks: number
  }
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await apiClient.get<Album[]>('/api/albums')
        setAlbums(data)
      } catch (error) {
        console.error('Failed to fetch albums:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading albums...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-6xl font-bold text-white mb-4">Albums</h1>
          <p className="text-gray-300 text-lg">
            Explore collections of amazing tracks from your favorite artists
          </p>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {albums.length === 0 ? (
          <div className="text-center py-20 bg-[#1a1a1a] border border-gray-800 rounded-lg">
            <div className="text-6xl mb-4">💿</div>
            <h3 className="text-2xl font-bold text-white mb-2">No albums yet</h3>
            <p className="text-gray-400">Albums will appear here once they&apos;re added</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all duration-200 group"
              >
                {/* Album Cover */}
                <div className="relative w-full aspect-square bg-gray-800 rounded-md mb-4 overflow-hidden">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      💿
                    </div>
                  )}
                  
                  {/* Hover overlay with play button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#00d9ff] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                      <svg
                        className="w-6 h-6 text-black ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Album Info */}
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-[#00d9ff] transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate mb-1">
                    {album.artist.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {album._count.tracks} {album._count.tracks === 1 ? 'track' : 'tracks'}
                    {album.releaseDate && ` • ${new Date(album.releaseDate).getFullYear()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
