'use client'

import { useEffect, useState } from 'react'
import { usePlayer } from '@/hooks/usePlayer'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  artist: {
    id: string
    name: string
  }
  album: {
    id: string
    title: string
  } | null
}

export default function TrackDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackId, setTrackId] = useState<string | null>(null)
  const [similarTracks, setSimilarTracks] = useState<Track[]>([])
  const [albumTracks, setAlbumTracks] = useState<Track[]>([])
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([])
  const { playTrack, currentTrack, isPlaying, pause, addToQueue } = usePlayer()
  const router = useRouter()

  // Handle async params in Next.js 15+
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setTrackId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!trackId) return
    
    fetch(`/api/tracks/${trackId}`)
      .then(res => {
        if (!res.ok) throw new Error('Track not found')
        return res.json()
      })
      .then(data => setTrack(data))
      .catch(() => router.push('/tracks'))
      .finally(() => setLoading(false))
  }, [trackId, router])

  // Fetch album tracks if track has an album
  useEffect(() => {
    if (!track || !track.album) return
    
    fetch(`/api/albums/${track.album.id}`)
      .then(res => res.json())
      .then(data => {
        // Filter out current track
        const filtered = data.tracks.filter((t: Track) => t.id !== track.id)
        setAlbumTracks(filtered)
      })
      .catch(console.error)
  }, [track])

  // Fetch similar tracks (same artist)
  useEffect(() => {
    if (!track) return
    
    fetch(`/api/tracks?artistId=${track.artist.id}`)
      .then(res => res.json())
      .then(data => {
        // Filter out current track and limit to 20
        const filtered = data.filter((t: Track) => t.id !== track.id).slice(0, 20)
        setSimilarTracks(filtered)
      })
      .catch(console.error)
  }, [track])

  // Fetch recommended tracks (collaborative filtering + genre-based)
  useEffect(() => {
    if (!trackId) return
    
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    fetch(`/api/tracks/${trackId}/recommendations`, { headers })
      .then(res => res.json())
      .then(data => {
        setRecommendedTracks(data.tracks || [])
      })
      .catch(console.error)
  }, [trackId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!track) return null

  const isCurrentTrack = currentTrack?.id === track.id

  const handlePlayClick = () => {
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRadio = () => {
    if (!track) return
    
    // Play current track first
    playTrack({
      id: track.id,
      title: track.title,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      artist: track.artist,
    })
    
    // Add similar tracks to queue
    similarTracks.forEach(t => {
      addToQueue({
        id: t.id,
        title: t.title,
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl,
        artist: t.artist,
      })
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      {/* Track Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end gap-8">
            {/* Cover Art */}
            <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 shadow-2xl">
              {track.coverUrl ? (
                <Image
                  src={track.coverUrl}
                  alt={track.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  🎵
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 pb-4">
              <p className="text-sm font-semibold text-[#00d9ff] mb-2">TRACK</p>
              <h1 className="text-6xl font-bold text-white mb-4 break-words">{track.title}</h1>
              <div className="flex items-center gap-2 text-gray-300">
                <Link 
                  href={`/artists/${track.artist.id}`}
                  className="hover:text-white hover:underline"
                >
                  {track.artist.name}
                </Link>
                {track.album && (
                  <>
                    <span>•</span>
                    <span>{track.album.title}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handlePlayClick}
              className="bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full p-4 hover:scale-105 transition-all shadow-lg"
            >
              {isCurrentTrack && isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleStartRadio}
              disabled={similarTracks.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-full border border-gray-700 hover:border-[#00d9ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v6h-2z" />
              </svg>
              Start Radio
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Album & Similar Tracks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended For You */}
            {recommendedTracks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-[#00d9ff]">✨</span>
                  Recommended For You
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Because you&apos;re listening to this track
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedTracks.slice(0, 6).map((recTrack) => (
                    <div
                      key={recTrack.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] transition-colors group"
                    >
                      <button
                        onClick={() => playTrack({
                          id: recTrack.id,
                          title: recTrack.title,
                          audioUrl: recTrack.audioUrl,
                          coverUrl: recTrack.coverUrl,
                          artist: recTrack.artist,
                        })}
                        className="flex-shrink-0 bg-[#00d9ff] hover:bg-[#00c4e6] text-black p-2 rounded-full transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      
                      {recTrack.coverUrl && (
                        <Image
                          src={recTrack.coverUrl}
                          alt={recTrack.title}
                          width={40}
                          height={40}
                          className="rounded flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/tracks/${recTrack.id}`}
                          className="text-white font-medium hover:text-[#00d9ff] truncate block text-sm"
                        >
                          {recTrack.title}
                        </Link>
                        <p className="text-gray-400 text-xs truncate">{recTrack.artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* More from this Album */}
            {track.album && albumTracks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">More from {track.album.title}</h2>
                  <Link
                    href={`/albums/${track.album.id}`}
                    className="text-[#00d9ff] hover:underline text-sm font-semibold"
                  >
                    View Album
                  </Link>
                </div>
                <div className="space-y-2">
                  {albumTracks.slice(0, 5).map((albumTrack) => (
                    <div
                      key={albumTrack.id}
                      className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group"
                    >
                      <button
                        onClick={() => playTrack({
                          id: albumTrack.id,
                          title: albumTrack.title,
                          audioUrl: albumTrack.audioUrl,
                          coverUrl: albumTrack.coverUrl,
                          artist: albumTrack.artist,
                        })}
                        className="w-10 h-10 flex items-center justify-center bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      
                      {albumTrack.coverUrl && (
                        <Image
                          src={albumTrack.coverUrl}
                          alt={albumTrack.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/tracks/${albumTrack.id}`}
                          className="text-white font-medium hover:text-[#00d9ff] truncate block"
                        >
                          {albumTrack.title}
                        </Link>
                        <p className="text-gray-400 text-sm truncate">{albumTrack.artist.name}</p>
                      </div>
                      
                      <span className="text-gray-500 text-sm">
                        {formatDuration(albumTrack.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* More by Artist */}
            {similarTracks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">More by {track.artist.name}</h2>
                <div className="space-y-2">
                  {similarTracks.slice(0, 10).map((similarTrack) => (
                    <div
                      key={similarTrack.id}
                      className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group"
                    >
                      <button
                        onClick={() => playTrack({
                          id: similarTrack.id,
                          title: similarTrack.title,
                          audioUrl: similarTrack.audioUrl,
                          coverUrl: similarTrack.coverUrl,
                          artist: similarTrack.artist,
                        })}
                        className="w-10 h-10 flex items-center justify-center bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      
                      {similarTrack.coverUrl && (
                        <Image
                          src={similarTrack.coverUrl}
                          alt={similarTrack.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/tracks/${similarTrack.id}`}
                          className="text-white font-medium hover:text-[#00d9ff] truncate block"
                        >
                          {similarTrack.title}
                        </Link>
                        <p className="text-gray-400 text-sm truncate">{similarTrack.artist.name}</p>
                      </div>
                      
                      <span className="text-gray-500 text-sm">
                        {formatDuration(similarTrack.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Now Playing Card */}
          <div className="lg:col-span-1">
            {currentTrack && (
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 sticky top-4">
                <h3 className="text-lg font-semibold text-white mb-4">Now Playing</h3>
                <Link href="/now-playing" className="block group">
                  {currentTrack.coverUrl && (
                    <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={currentTrack.coverUrl}
                        alt={currentTrack.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <h4 className="text-white font-medium mb-1 truncate group-hover:text-[#00d9ff] transition-colors">
                    {currentTrack.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{currentTrack.artist.name}</p>
                </Link>
                
                {isPlaying && (
                  <div className="mt-4 flex items-center gap-2 text-[#00d9ff] text-sm">
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-[#00d9ff] animate-pulse" />
                      <div className="w-1 h-4 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-3 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Playing</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
