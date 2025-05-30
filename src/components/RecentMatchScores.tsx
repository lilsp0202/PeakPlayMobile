"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Calendar,
  MapPin,
  Star,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";

interface MatchStats {
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  wickets?: number;
  overs?: number;
  economyRate?: number;
  catches?: number;
  runOuts?: number;
}

interface MatchPerformance {
  id: string;
  position?: string;
  stats: string;
  rating?: number;
  notes?: string;
  match: {
    id: string;
    matchName: string;
    opponent: string;
    venue?: string;
    matchDate: string;
    sport: string;
    matchType: string;
    result?: string;
  };
  student: {
    studentName: string;
    sport: string;
    role: string;
  };
}

interface RecentMatchScoresProps {
  studentId?: string;
  isCoachView?: boolean;
}

const ResultColors = {
  WIN: "text-green-600 bg-green-50 border-green-200",
  LOSS: "text-red-600 bg-red-50 border-red-200",
  DRAW: "text-yellow-600 bg-yellow-50 border-yellow-200",
  ABANDONED: "text-gray-600 bg-gray-50 border-gray-200",
};

const MatchTypeColors = {
  PRACTICE: "bg-blue-100 text-blue-800",
  FRIENDLY: "bg-green-100 text-green-800",
  LEAGUE: "bg-purple-100 text-purple-800",
  TOURNAMENT: "bg-orange-100 text-orange-800",
  CHAMPIONSHIP: "bg-red-100 text-red-800",
};

const CricketStatsDisplay: React.FC<{ stats: MatchStats; role: string }> = ({ stats, role }) => {
  const isBatsman = role === "BATSMAN" || role === "ALL_ROUNDER";
  const isBowler = role === "BOWLER" || role === "ALL_ROUNDER";
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      {isBatsman && (
        <>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.runs || 0}</div>
            <div className="text-xs text-indigo-500">Runs</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.balls || 0}</div>
            <div className="text-xs text-indigo-500">Balls</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.strikeRate?.toFixed(1) || '0.0'}</div>
            <div className="text-xs text-indigo-500">Strike Rate</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{(stats.fours || 0) + (stats.sixes || 0)}</div>
            <div className="text-xs text-indigo-500">Boundaries</div>
          </div>
        </>
      )}
      
      {/* Fielding stats for all players */}
      {((stats.catches || 0) + (stats.runOuts || 0)) > 0 && (
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{(stats.catches || 0) + (stats.runOuts || 0)}</div>
          <div className="text-xs text-green-500">Fielding</div>
        </div>
      )}
    </div>
  );
};

const MatchCard: React.FC<{ performance: MatchPerformance }> = ({ performance }) => {
  const { match, student } = performance;
  const stats: MatchStats = JSON.parse(performance.stats || '{}');
  const matchDate = new Date(match.matchDate).toLocaleDateString();
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6" />
            <div>
              <h3 className="font-semibold text-lg">{match.matchName}</h3>
              <p className="text-indigo-100 text-sm">vs {match.opponent}</p>
            </div>
          </div>
          
          {match.result && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${ResultColors[match.result as keyof typeof ResultColors]}`}>
              {match.result}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-indigo-100 text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{matchDate}</span>
          </div>
          
          {match.venue && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[120px]">{match.venue}</span>
            </div>
          )}
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${MatchTypeColors[match.matchType as keyof typeof MatchTypeColors]}`}>
            {match.matchType}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {performance.position && (
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Position: {performance.position}</span>
          </div>
        )}
        
        {/* Performance Rating */}
        {performance.rating && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Performance Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(performance.rating! / 2) 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {performance.rating.toFixed(1)}/10
              </span>
            </div>
          </div>
        )}
        
        {/* Cricket Stats */}
        <CricketStatsDisplay stats={stats} role={student.role} />
        
        {/* Coach Notes */}
        {performance.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Coach Notes</span>
            </div>
            <p className="text-sm text-gray-600">{performance.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RecentMatchScores({ studentId, isCoachView = false }: RecentMatchScoresProps) {
  const [matches, setMatches] = useState<MatchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        let url = "/api/matches";
        if (studentId && isCoachView) {
          url += `?studentId=${studentId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        
        const data = await response.json();
        setMatches(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load match data");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [studentId, isCoachView]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Loading match scores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-red-400 mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Matches</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Match Scores</h2>
              <p className="text-gray-600">No recent matches available</p>
            </div>
          </div>
        </div>
        
        {/* Placeholder content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Recent Matches</h3>
            <p className="text-gray-500">Match scores will appear here once data is added.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Match Scores</h2>
            <p className="text-gray-600">Latest {matches.length} match performances</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated recently</span>
        </div>
      </div>
      
      {/* Match Cards */}
      <div className="grid gap-6">
        {matches.slice(0, 5).map((performance) => (
          <MatchCard key={performance.id} performance={performance} />
        ))}
      </div>
    </div>
  );
} 