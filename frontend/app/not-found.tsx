import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-gray-300">404</div>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the
            wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
              <Link href="/search">
                <Search className="h-4 w-4" />
                Search
              </Link>
            </Button>
          </div>

          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Popular Links */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Pages</h3>
          <div className="space-y-2">
            <Link href="/feed" className="block text-blue-600 hover:text-blue-800 text-sm">
              Community Feed
            </Link>
            <Link href="/create" className="block text-blue-600 hover:text-blue-800 text-sm">
              Ask a Question
            </Link>
            <Link href="/leaderboard" className="block text-blue-600 hover:text-blue-800 text-sm">
              Leaderboard
            </Link>
            <Link href="/credits" className="block text-blue-600 hover:text-blue-800 text-sm">
              Credits & Rewards
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
