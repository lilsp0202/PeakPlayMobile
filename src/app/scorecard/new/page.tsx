'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ScorecardUploadModal from '@/components/ScorecardUploadModal';

export default function NewScorecardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else if ((session.user as any).role !== 'ATHLETE') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleAnalysisComplete = async (result: any) => {
    try {
      // Create match data from the analysis result
      const matchData = {
        studentId: session?.user?.id,
        matchName: result.matchDetails.matchName || `Match vs ${result.matchDetails.opponent}`,
        opponent: result.matchDetails.opponent,
        venue: result.matchDetails.venue,
        matchDate: result.matchDetails.matchDate,
        sport: "CRICKET",
        matchType: result.matchDetails.matchType || "FRIENDLY",
        result: result.matchDetails.result,
        position: "BATSMAN", // Default, can be updated based on stats
        stats: JSON.stringify({
          runs: result.playerStats.batting.runs,
          balls: result.playerStats.batting.balls,
          fours: result.playerStats.batting.fours,
          sixes: result.playerStats.batting.sixes,
          wickets: result.playerStats.bowling.wickets,
          overs: result.playerStats.bowling.overs,
          runsConceded: result.playerStats.bowling.runs,
          catches: result.playerStats.fielding.catches,
          runOuts: result.playerStats.fielding.runOuts,
          stumpings: result.playerStats.fielding.stumpings
        }),
        rating: null,
        notes: result.notes || ""
      };

      // Submit the match data
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        // Redirect to dashboard after successful submission
        router.push('/dashboard?tab=performance');
      } else {
        const error = await response.json();
        alert(`Failed to save match: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match. Please try again.');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/scorecard');
  };

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
            <div className="flex items-center">
              <Link
                href="/scorecard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload Scorecard</h1>
                <p className="mt-1 text-gray-600">Upload and analyze your cricket scorecard</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload a clear photo of your cricket scorecard</li>
            <li>Our AI will analyze and extract your statistics</li>
            <li>Review the extracted data for accuracy</li>
            <li>Save the match to your performance history</li>
          </ol>
        </div>

        {/* Modal Container */}
        <div className="bg-white rounded-xl shadow-sm">
          <ScorecardUploadModal
            isOpen={isModalOpen}
            onClose={handleClose}
            onAnalysisComplete={handleAnalysisComplete}
            role="BATSMAN"
          />
        </div>
      </div>
    </div>
  );
} 