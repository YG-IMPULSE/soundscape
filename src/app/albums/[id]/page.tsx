'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { usePlayer } from '@/hooks/usePlayer'
import TrackList from '@/components/tracks/TrackList'

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  plays: number
  releaseYear?: number | null
  artist: {
    id: string
    name: string
  }
  album: {
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

interface Album {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  releaseDate?: string | null
  artist: {
    id: string
    name: string
    image?: string | null
  }
  tracks: Track[]
}

export default function AlbumDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { playTrack, addToQueue } = usePlayer()
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await apiClient.get<Album>(`/api/albums/${params.id}`)
        setAlbum(data)
      } catch (error) {
        console.error('Failed to fetch album:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAlbum()
    }
  }, [params.id])

  const handlePlayAll = () => {
    if (!album || album.tracks.length === 0) return

    // Play first track
    playTrack(album.tracks[0])

    // Add remaining tracks to queue
    album.tracks.slice(1).forEach((track) => {
      addToQueue(track)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading album...</div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Album not found</h2>
          <button
            onClick={() => router.push('/albums')}
            className="text-[#00d9ff] hover:underline"
          >
            Back to Albums
          </button>
        </div>
      </div>
    )
  }

  const totalDuration = album.tracks.reduce((acc, track) => acc + track.duration, 0)
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      {/* Album Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Album Cover */}
            <div className="relative w-full md:w-64 aspect-square bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 shadow-2xl">
              {album.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  💿
                </div>
              )}
            </div>

            {/* Album Info */}
            <div className="flex-1 pb-4">
              <p className="text-sm font-semibold text-[#00d9ff] mb-2">ALBUM</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {album.title}
              </h1>
              
              {/* Artist */}
              <div className="flex items-center gap-2 mb-4">
                {album.artist.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.artist.image}
                    alt={album.artist.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <Link
                  href={`/artists/${album.artist.id}`}
                  className="text-white font-semibold hover:underline"
                >
                  {album.artist.name}
                </Link>
              </div>

              {/* Album Stats */}
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                {album.releaseDate && (
                  <span>{new Date(album.releaseDate).getFullYear()}</span>
                )}
                {album.releaseDate && <span>•</span>}
                <span>{album.tracks.length} {album.tracks.length === 1 ? 'song' : 'songs'}</span>
                <span>•</span>
                <span>
                  {hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`}
                </span>
              </div>

              {/* Description */}
              {album.description && (
                <p className="text-gray-400 mt-4 max-w-2xl">{album.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Tracklist */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Play All Button */}
        <div className="mb-8">
          <button
            onClick={handlePlayAll}
            disabled={album.tracks.length === 0}
            className="bg-[#00d9ff] hover:bg-[#00c4e6] text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Play Album
          </button>
        </div>

        {/* Tracklist */}
        {album.tracks.length === 0 ? (
          <div className="text-center py-20 bg-[#1a1a1a] border border-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-white mb-2">No tracks yet</h3>
            <p className="text-gray-400">This album doesn&apos;t have any tracks</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Tracks</h2>
            <TrackList tracks={album.tracks} />
          </div>
        )}
      </div>
    </div>
  )
}
