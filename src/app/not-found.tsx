import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold mb-4 text-cyan-500">404</div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            Go Home
          </Link>
          
          <Link
            href="/tracks"
            className="block w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
          >
            Browse Tracks
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Looking for something specific?</p>
          <Link href="/search" className="text-cyan-500 hover:underline">
            Try our search
          </Link>
        </div>
      </div>
    </div>
  )
}
