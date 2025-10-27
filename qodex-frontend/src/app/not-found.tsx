import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold text-gray-800">404</h2>
        <h3 className="text-2xl font-semibold text-gray-600">Page Not Found</h3>
        <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}