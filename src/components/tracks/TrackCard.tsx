'use client'

import { useState, useEffect, useRef } from 'react'
import { usePlayer } from '@/hooks/usePlayer'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

interface TrackCardProps {
  track: Track
}

export default function TrackCard({ track }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying, pause } = usePlayer()
  const { user } = useAuth()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isCurrentTrack = currentTrack?.id === track.id

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isCurrentTrack && isPlaying) {
      pause()
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        artist: track.artist,
      })
    }
  }

  // Check if track is liked on mount
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!user) return
      
      try {
        const response = await apiClient.get<{ tracks: Array<{ id: string }> }>('/api/me/liked')
        const liked = response.tracks?.some((t) => t.id === track.id) ?? false
        setIsLiked(liked)
      } catch (error) {
        console.error('Failed to check liked status:', error)
        setIsLiked(false)
      }
    }

    checkLikedStatus()
  }, [user, track.id])

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) return

    try {
      const response = await apiClient.post<{ liked: boolean }>('/api/me/liked', { trackId: track.id })
      setIsLiked(response.liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleGoToArtist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/artists/${track.artist.id}`)
  }

  const handleGoToAlbum = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (track.album) {
      router.push(`/albums/${track.album.id}`)
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/tracks/${track.id}`
    await navigator.clipboard.writeText(url)
    setShowMenu(false)
    // TODO: Show toast notification
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPlays = (plays: number = 0) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`
    return plays.toString()
  }

  return (
    <Link
      href={`/tracks/${track.id}`}
      className="group bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all border border-gray-800 hover:border-gray-700"
    >
      {/* Cover Image */}
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-gray-800">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎵
          </div>
        )}

        {/* Play Button - Bottom Right */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 rounded-full p-3 transition-all shadow-lg z-10 ${
            isCurrentTrack && isPlaying
              ? 'bg-[#00d9ff] opacity-100'
              : 'bg-[#00d9ff] opacity-0 group-hover:opacity-100'
          } hover:scale-110`}
        >
          {isCurrentTrack && isPlaying ? (
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white truncate group-hover:text-[#00d9ff] transition-colors">
          {track.title}
        </h3>
        <p className="text-sm text-gray-400 truncate">{track.artist.name}</p>
        
        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDuration(track.duration)}</span>
          {track.releaseYear && (
            <>
              <span>•</span>
              <span>{track.releaseYear}</span>
            </>
          )}
          {track.plays !== undefined && track.plays > 0 && (
            <>
              <span>•</span>
              <span>{formatPlays(track.plays)} plays</span>
            </>
          )}
        </div>

        {track.album && (
          <p className="text-xs text-gray-500 truncate">{track.album.title}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        {/* Like Button */}
        {user && (
          <button
            onClick={handleLikeClick}
            className="p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-black/80"
            aria-label={isLiked ? 'Unlike track' : 'Like track'}
          >
            <svg
              className={`w-5 h-5 transition-colors ${isLiked ? 'fill-[#00d9ff] text-[#00d9ff]' : 'fill-none text-gray-400'}`}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-black/80"
            aria-label="More options"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50 py-1">
              {user && (
                <button
                  onClick={handleAddToPlaylist}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-[#00d9ff] transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add to playlist
                </button>
              )}
              
              <button
                onClick={handleGoToArtist}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-[#00d9ff] transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Go to artist
              </button>

              {track.album && (
                <button
                  onClick={handleGoToAlbum}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-[#00d9ff] transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Go to album
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-[#00d9ff] transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copy link
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
