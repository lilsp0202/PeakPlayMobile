import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | PeakPlay",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600 opacity-80">404</h1>
            <div className="mt-4">
              <svg
                className="mx-auto h-20 w-20 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go Back Home
            </Link>
            
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Search suggestion */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Popular pages you might be looking for:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
                Dashboard
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/marketplace" className="text-blue-600 hover:underline text-sm">
                Marketplace
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/bookings" className="text-blue-600 hover:underline text-sm">
                Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 