'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NowPlayingPage() {
  const router = useRouter()
  const { 
    currentTrack, 
    isPlaying, 
    pause, 
    resume,
    skipNext,
    skipPrevious,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    shuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    queue,
    removeFromQueue,
    getNextTrack
  } = usePlayer()

  const [showLyrics, setShowLyrics] = useState(false)

  useEffect(() => {
    // Redirect to tracks if no track is playing
    if (!currentTrack) {
      router.push('/tracks')
    }
  }, [currentTrack, router])

  if (!currentTrack) {
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const nextTrack = getNextTrack()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black pb-32">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Album Art & Info */}
          <div className="space-y-8">
            {/* Album Art */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#00d9ff]/20 to-transparent">
              {currentTrack.coverUrl ? (
                <Image
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">🎵</span>
                </div>
              )}
              
              {/* Playing Animation Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {isPlaying && (
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-8 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-6 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-10 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 h-7 bg-[#00d9ff] animate-pulse" style={{ animationDelay: '450ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                {currentTrack.title}
              </h1>
              <Link 
                href={`/artists/${currentTrack.artist.id}`}
                className="text-2xl text-gray-400 hover:text-[#00d9ff] transition-colors inline-block"
              >
                {currentTrack.artist.name}
              </Link>

              {/* Metadata */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Controls & Queue */}
          <div className="space-y-8">
            {/* Playback Controls */}
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
              {/* Progress Bar */}
              <div className="space-y-2 mb-8">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #00d9ff ${progressPercentage}%, #374151 ${progressPercentage}%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={toggleShuffle}
                  className={`transition-colors ${shuffle ? 'text-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}
                  title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                  </svg>
                </button>

                <button
                  onClick={skipPrevious}
                  className="text-white hover:text-[#00d9ff] transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>

                <button
                  onClick={isPlaying ? pause : resume}
                  className="bg-[#00d9ff] hover:bg-[#00c4e6] text-black rounded-full p-6 hover:scale-105 transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={skipNext}
                  className="text-white hover:text-[#00d9ff] transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-11-1l8.5-6-8.5-6z" />
                  </svg>
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`transition-colors ${repeatMode !== 'off' ? 'text-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            {/* Next Up */}
            {nextTrack && (
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Next Up</h3>
                <div className="flex items-center gap-4 group">
                  {nextTrack.coverUrl && (
                    <Image
                      src={nextTrack.coverUrl}
                      alt={nextTrack.title}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate group-hover:text-[#00d9ff] transition-colors">
                      {nextTrack.title}
                    </p>
                    <p className="text-gray-400 text-sm truncate">{nextTrack.artist.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Queue Preview */}
            {queue.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Queue ({queue.length})
                  </h3>
                  <Link 
                    href="/queue"
                    className="text-sm text-[#00d9ff] hover:text-[#00c4e6] transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {queue.slice(0, 5).map((track, index) => (
                    <div key={`${track.id}-${index}`} className="flex items-center gap-3 group">
                      <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                      {track.coverUrl && (
                        <Image
                          src={track.coverUrl}
                          alt={track.title}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate group-hover:text-[#00d9ff] transition-colors">
                          {track.title}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{track.artist.name}</p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lyrics Toggle */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-2xl p-6 border border-gray-800 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-white font-medium">Lyrics</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showLyrics ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {showLyrics && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-center italic">
                    Lyrics not available for this track
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
