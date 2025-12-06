'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'

interface AdminStats {
  overview: {
    totalUsers: number
    totalStreams: number
    totalTracks: number
    totalArtists: number
    recentSignups: number
    activeUsers: number
    recentUploads: number
  }
  topTracks: Array<{
    id: string
    title: string
    artist: string
    plays: number
    likes: number
    coverUrl: string | null
  }>
  topArtists: Array<{
    id: string
    name: string
    totalPlays: number
    followers: number
    trackCount: number
    image: string | null
  }>
  signupsByDay: Record<string, number>
}

interface Artist {
  id: string
  name: string
}

interface Genre {
  id: string
  name: string
}

type TabType = 'dashboard' | 'upload' | 'tracks'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [artists, setArtists] = useState<Artist[]>([])
  const [genres, setGenres] = useState<Genre[]>([])

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artistId: '',
    albumId: '',
    genreIds: [] as string[],
    duration: 0,
    explicit: false,
    audioFile: null as File | null,
    coverFile: null as File | null
  })
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      fetchAdminData()
    }
  }, [user, authLoading, router])

  const fetchAdminData = async () => {
    try {
      const [statsData, artistsData, genresData] = await Promise.all([
        apiClient.get<AdminStats>('/api/admin/stats'),
        apiClient.get<Artist[]>('/api/artists'),
        apiClient.get<Genre[]>('/api/genres')
      ])
      
      setStats(statsData)
      setArtists(artistsData)
      setGenres(genresData)
    } catch (error: any) {
      if (error.status === 403) {
        alert('You do not have admin access')
        router.push('/')
      }
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.audioFile || !uploadForm.title || !uploadForm.artistId) {
      setUploadMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setUploading(true)
    setUploadMessage(null)

    try {
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('artistId', uploadForm.artistId)
      if (uploadForm.albumId) formData.append('albumId', uploadForm.albumId)
      formData.append('genreIds', uploadForm.genreIds.join(','))
      formData.append('duration', uploadForm.duration.toString())
      formData.append('explicit', uploadForm.explicit.toString())
      formData.append('audioFile', uploadForm.audioFile)
      if (uploadForm.coverFile) formData.append('coverFile', uploadForm.coverFile)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        setUploadMessage({ type: 'success', text: 'Track uploaded successfully!' })
        setUploadForm({
          title: '',
          artistId: '',
          albumId: '',
          genreIds: [],
          duration: 0,
          explicit: false,
          audioFile: null,
          coverFile: null
        })
        // Refresh stats
        fetchAdminData()
      } else {
        const error = await response.json()
        setUploadMessage({ type: 'error', text: error.error || 'Upload failed' })
      }
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' })
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d9ff] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-black pt-20 pb-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#00d9ff] rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-[#00d9ff] border-b-2 border-[#00d9ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'text-[#00d9ff] border-b-2 border-[#00d9ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload Track
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="py-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{stats.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">+{stats.overview.recentSignups} this week</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Streams</h3>
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{stats.overview.totalStreams.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">{stats.overview.activeUsers} active users</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Tracks</h3>
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{stats.overview.totalTracks.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">+{stats.overview.recentUploads} this month</p>
              </div>

              <div className="bg-gradient-to-br from-[#00d9ff]/20 to-[#00d9ff]/10 border border-[#00d9ff]/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Artists</h3>
                  <svg className="w-8 h-8 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{stats.overview.totalArtists.toLocaleString()}</p>
              </div>
            </div>

            {/* Top Tracks */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Top Tracks</h2>
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0a0a0a] border-b border-gray-800">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Track</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Artist</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Plays</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topTracks.map((track, index) => (
                      <tr key={track.id} className="border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors">
                        <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {track.coverUrl ? (
                              <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                                <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                            )}
                            <span className="font-medium text-white">{track.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{track.artist}</td>
                        <td className="py-3 px-4 text-right text-white font-medium">{track.plays.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{track.likes.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Artists */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Top Artists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.topArtists.map((artist) => (
                  <div key={artist.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:bg-[#2a2a2a] transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      {artist.image ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                          <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00d9ff]/30 to-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-lg">{artist.name}</h3>
                        <p className="text-sm text-gray-400">{artist.trackCount} tracks</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Plays</p>
                        <p className="text-lg font-bold text-[#00d9ff]">{artist.totalPlays.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Followers</p>
                        <p className="text-lg font-bold text-white">{artist.followers.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="py-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Upload New Track</h2>
            
            {uploadMessage && (
              <div className={`mb-6 p-4 rounded-lg border ${
                uploadMessage.type === 'success'
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
              }`}>
                {uploadMessage.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {/* Track Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter track title"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff]"
                  required
                />
              </div>

              {/* Artist Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <select
                  value={uploadForm.artistId}
                  onChange={(e) => setUploadForm({ ...uploadForm, artistId: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00d9ff]"
                  required
                >
                  <option value="">Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genres
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadForm.genreIds.includes(genre.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUploadForm({
                              ...uploadForm,
                              genreIds: [...uploadForm.genreIds, genre.id]
                            })
                          } else {
                            setUploadForm({
                              ...uploadForm,
                              genreIds: uploadForm.genreIds.filter(id => id !== genre.id)
                            })
                          }
                        }}
                        className="w-4 h-4 bg-[#1a1a1a] border-gray-700 rounded text-[#00d9ff] focus:ring-[#00d9ff]"
                      />
                      <span className="text-gray-300 text-sm">{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  value={uploadForm.duration || ''}
                  onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) || 0 })}
                  placeholder="180"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff]"
                  required
                />
              </div>

              {/* Explicit Content */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadForm.explicit}
                    onChange={(e) => setUploadForm({ ...uploadForm, explicit: e.target.checked })}
                    className="w-5 h-5 bg-[#1a1a1a] border-gray-700 rounded text-[#00d9ff] focus:ring-[#00d9ff]"
                  />
                  <span className="text-gray-300">Explicit Content</span>
                </label>
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio File * (MP3, WAV, etc.)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, audioFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00d9ff] file:text-black file:font-semibold hover:file:bg-[#00c4e6]"
                  required
                />
                {uploadForm.audioFile && (
                  <p className="mt-2 text-sm text-gray-400">Selected: {uploadForm.audioFile.name}</p>
                )}
              </div>

              {/* Cover Art Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Art (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, coverFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:font-semibold hover:file:bg-gray-600"
                />
                {uploadForm.coverFile && (
                  <p className="mt-2 text-sm text-gray-400">Selected: {uploadForm.coverFile.name}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-6 py-4 bg-[#00d9ff] hover:bg-[#00c4e6] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Track'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
