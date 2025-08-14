import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
