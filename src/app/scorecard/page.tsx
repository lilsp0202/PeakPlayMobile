'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Plus, FileText, Home } from 'lucide-react';
import Link from 'next/link';

export default function ScorecardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else if ((session.user as any).role !== 'ATHLETE') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || (session.user as any).role !== 'ATHLETE') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Cricket Scoring</h1>
              <p className="mt-2 text-gray-600">Score your cricket matches ball-by-ball in real-time</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <Link
                href="/scorecard/new"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Match
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Matches Scored Yet</h2>
            <p className="text-gray-600 mb-6">
              Start scoring your first cricket match with our ball-by-ball scoring system
            </p>
            <Link
              href="/scorecard/new"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Scoring Now
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
                          </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Scoring</h3>
              <p className="text-gray-600">
                Score matches ball-by-ball with live statistics for batsmen, bowlers, and teams
              </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
                          </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Everything</h3>
              <p className="text-gray-600">
                Runs, wickets, extras, boundaries, strike rates, economy rates - all tracked automatically
              </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
                          </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Matches</h3>
              <p className="text-gray-600">
                Complete match data saved to your performance history for future analysis
              </p>
          </div>
        </div>
      </div>
    </div>
  );
} 