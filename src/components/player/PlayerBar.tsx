'use client'

import { useState } from 'react'
import { usePlayer } from '@/hooks/usePlayer'
import Image from 'next/image'
import Link from 'next/link'

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    shuffle,
    repeatMode,
    pause,
    resume,
    skipNext,
    skipPrevious,
    setVolume,
    seek,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
    getNextTrack,
  } = usePlayer()

  const [showQueue, setShowQueue] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
  }

  const nextTrack = getNextTrack()

  if (!currentTrack) return null

  return (
    <>
      {/* Queue Drawer */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-2rem)] bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[60vh] flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Queue ({queue.length})</h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p>Queue is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {queue.map((track, index) => (
                  <div key={`${track.id}-${index}`} className="p-3 hover:bg-[#2a2a2a] flex items-center gap-3 group">
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
                      <p className="text-white text-sm truncate">{track.title}</p>
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
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#1a1a1a] px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {/* Track Info */}
          <Link 
            href="/now-playing"
            className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto hover:bg-[#1a1a1a] rounded-lg p-1 -m-1 transition-colors group"
          >
            {currentTrack.coverUrl && (
              <Image
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                width={48}
                height={48}
                className="rounded sm:w-14 sm:h-14"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium truncate text-sm sm:text-base group-hover:text-[#00d9ff] transition-colors">
                {currentTrack.title}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm truncate">
                {currentTrack.artist.name}
              </div>
            </div>
          </Link>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleShuffle}
                className={`transition-colors hidden sm:block ${shuffle ? 'text-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}
                title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>

              <button
                onClick={skipPrevious}
                className="text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                className="bg-[#00d9ff] text-black rounded-full p-2 hover:scale-105 hover:bg-[#00c4e6] transition-all"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={skipNext}
                className="text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 18h2V6h-2zm-11-1l8.5-6-8.5-6z" />
                </svg>
              </button>

              <button
                onClick={toggleRepeat}
                className={`transition-colors hidden sm:block ${repeatMode !== 'off' ? 'text-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`transition-colors hidden sm:block ${showQueue ? 'text-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}
                title="Queue"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
              </button>
            </div>

            {/* Next Up Info */}
            {nextTrack && (
              <div className="hidden sm:block text-xs text-gray-500 text-center">
                Next up: <span className="text-gray-400">{nextTrack.title} - {nextTrack.artist.name}</span>
              </div>
            )}

            {/* Progress Bar */}
            <div className="flex items-center gap-1 sm:gap-2 w-full max-w-2xl">
              <span className="text-[10px] sm:text-xs text-gray-400 w-8 sm:w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-[10px] sm:text-xs text-gray-400 w-8 sm:w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
