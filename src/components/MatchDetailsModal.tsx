'use client';

import { X, MapPin } from 'lucide-react';
import { MatchPerformance } from './RecentMatchScores';

interface MatchDetailsModalProps {
  match: MatchPerformance;
  onClose: () => void;
}

export default function MatchDetailsModal({ match, onClose }: MatchDetailsModalProps) {
  const stats = JSON.parse(match.stats);
  const role = match.student?.role || "BATSMAN";

  // Calculate additional statistics
  const battingStats = {
    strikeRate: stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(2) : 0,
    boundaryPercentage: stats.balls > 0 ? (((stats.fours + stats.sixes) / stats.balls) * 100).toFixed(2) : 0,
    dotBallPercentage: stats.balls > 0 ? ((stats.dots / stats.balls) * 100).toFixed(2) : 0,
  };

  const bowlingStats = {
    economyRate: stats.overs > 0 ? (stats.runs / stats.overs).toFixed(2) : 0,
    wicketsPerOver: stats.overs > 0 ? (stats.wickets / stats.overs).toFixed(2) : 0,
    dotBallRate: stats.overs > 0 ? ((stats.dots / (stats.overs * 6)) * 100).toFixed(2) : 0,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{match.match.matchName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Match Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Opponent</p>
              <p className="font-medium text-gray-900">{match.match.opponent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Venue</p>
              <p className="font-medium text-gray-900">{match.match.venue || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{new Date(match.match.matchDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Result</p>
              <p className="font-medium text-gray-900">{match.match.result}</p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          {(role === "BATSMAN" || role === "ALL_ROUNDER") && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Batting Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Runs</p>
                  <p className="font-medium text-gray-900">{stats.runs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balls</p>
                  <p className="font-medium text-gray-900">{stats.balls}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Strike Rate</p>
                  <p className="font-medium text-gray-900">{battingStats.strikeRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fours</p>
                  <p className="font-medium text-gray-900">{stats.fours}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sixes</p>
                  <p className="font-medium text-gray-900">{stats.sixes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Boundary %</p>
                  <p className="font-medium text-gray-900">{battingStats.boundaryPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dot Balls</p>
                  <p className="font-medium text-gray-900">{stats.dots || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dot Ball %</p>
                  <p className="font-medium text-gray-900">{battingStats.dotBallPercentage}%</p>
                </div>
              </div>
            </div>
          )}

          {(role === "BOWLER" || role === "ALL_ROUNDER") && (
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bowling Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Overs</p>
                  <p className="font-medium text-gray-900">{stats.overs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wickets</p>
                  <p className="font-medium text-gray-900">{stats.wickets}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Economy</p>
                  <p className="font-medium text-gray-900">{bowlingStats.economyRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maidens</p>
                  <p className="font-medium text-gray-900">{stats.maidens}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wides</p>
                  <p className="font-medium text-gray-900">{stats.wides || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No Balls</p>
                  <p className="font-medium text-gray-900">{stats.noBalls || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wickets/Over</p>
                  <p className="font-medium text-gray-900">{bowlingStats.wicketsPerOver}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dot Ball %</p>
                  <p className="font-medium text-gray-900">{bowlingStats.dotBallRate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Fielding Stats */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fielding Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Catches</p>
                <p className="font-medium text-gray-900">{stats.catches || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Run Outs</p>
                <p className="font-medium text-gray-900">{stats.runOuts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stumpings</p>
                <p className="font-medium text-gray-900">{stats.stumpings || 0}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {match.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Match Notes</h3>
              <p className="text-gray-700">{match.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 