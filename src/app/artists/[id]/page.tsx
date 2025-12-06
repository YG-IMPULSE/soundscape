'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayer } from '@/hooks/usePlayer'
import Image from 'next/image'
import Link from 'next/link'

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

interface Artist {
  id: string
  name: string
  image: string | null
  bio: string | null
  tracks: Track[]
}

export default function ArtistDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [artistId, setArtistId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const { playTrack, currentTrack, isPlaying, addToQueue } = usePlayer()
  const router = useRouter()

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setArtistId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!artistId) return
    
    const fetchArtist = async () => {
      try {
        const artistRes = await fetch(`/api/artists/${artistId}`)
        if (!artistRes.ok) throw new Error('Artist not found')
        const artistData = await artistRes.json()
        setArtist(artistData)

        // Check follow status
        const token = localStorage.getItem('token')
        if (token) {
          const followRes = await fetch(`/api/artists/${artistId}/follow`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const followData = await followRes.json()
          setIsFollowing(followData.following)
        }
      } catch (error) {
        console.error('Failed to load artist:', error)
        router.push('/artists')
      } finally {
        setLoading(false)
      }
    }

    fetchArtist()
  }, [artistId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!artist) return null

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRadio = () => {
    if (!artist || artist.tracks.length === 0) return
    
    // Play first track
    const firstTrack = artist.tracks[0]
    playTrack({
      id: firstTrack.id,
      title: firstTrack.title,
      audioUrl: firstTrack.audioUrl,
      coverUrl: firstTrack.coverUrl,
      artist: firstTrack.artist,
    })
    
    // Add rest to queue
    artist.tracks.slice(1).forEach(t => {
      addToQueue({
        id: t.id,
        title: t.title,
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl,
        artist: t.artist,
      })
    })
  }

  const handleFollowToggle = async () => {
    if (!artistId) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      {/* Artist Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end gap-6">
            {/* Artist Image */}
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🎤
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1 pb-4">
              <p className="text-sm font-semibold text-[#00d9ff] mb-2">ARTIST</p>
              <h1 className="text-6xl font-bold text-white mb-4">{artist.name}</h1>
              <p className="text-gray-300">
                {artist.tracks.length} {artist.tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleStartRadio}
              disabled={artist.tracks.length === 0}
              className="flex items-center gap-3 px-8 py-4 bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Artist Radio
            </button>
            
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`px-6 py-4 rounded-full font-semibold transition-all border-2 ${
                isFollowing
                  ? 'bg-transparent border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/10'
                  : 'bg-transparent border-white text-white hover:border-[#00d9ff] hover:text-[#00d9ff]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bio & Tracks */}
          <div className="lg:col-span-2">
            {/* Bio */}
            {artist.bio && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
              </div>
            )}

            {/* Tracks */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Popular Tracks</h2>
              {artist.tracks.length === 0 ? (
                <p className="text-gray-400">No tracks available</p>
              ) : (
                <div className="space-y-2">
                  {artist.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group"
                    >
                      <span className="text-gray-500 text-sm w-8">{index + 1}</span>
                      
                      <button
                        onClick={() => playTrack({
                          id: track.id,
                          title: track.title,
                          audioUrl: track.audioUrl,
                          coverUrl: track.coverUrl,
                          artist: track.artist,
                        })}
                        className="w-10 h-10 flex items-center justify-center bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
                        <Link
                          href={`/tracks/${track.id}`}
                          className="text-white font-medium hover:text-[#00d9ff] truncate block"
                        >
                          {track.title}
                        </Link>
                        {track.album && (
                          <p className="text-gray-400 text-sm truncate">{track.album.title}</p>
                        )}
                      </div>
                      
                      <span className="text-gray-500 text-sm">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
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
