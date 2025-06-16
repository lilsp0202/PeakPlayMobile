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
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";

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
  const { data: session, status: sessionStatus } = useSession();
  const [matches, setMatches] = useState<MatchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<'BATTING' | 'BOWLING'>('BATTING');
  const [form, setForm] = useState<any>({
    matchName: '',
    opponent: '',
    venue: '',
    matchDate: '',
    matchType: 'PRACTICE',
    result: '',
    position: '',
    rating: '',
    notes: '',
    // Batting
    runs: '',
    balls: '',
    fours: '',
    sixes: '',
    // Bowling
    wickets: '',
    overs: '',
    economyRate: '',
    // Fielding
    catches: '',
    runOuts: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchPerformance | null>(null);

  // Number of matches to show in preview
  const PREVIEW_COUNT = 5;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        let url = "/api/matches";
        if (studentId && isCoachView) {
          url += `?studentId=${studentId}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch matches");
        const data = await response.json();
        setMatches(data);
        setError(null);
      } catch (err) {
        setError("Failed to load match data");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [studentId, isCoachView]);

  const handleToggleExpanded = () => setIsExpanded(!isExpanded);
  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => { setShowAddModal(false); setFormType('BATTING'); setForm({ matchName: '', opponent: '', venue: '', matchDate: '', matchType: 'PRACTICE', result: '', position: '', rating: '', notes: '', runs: '', balls: '', fours: '', sixes: '', wickets: '', overs: '', economyRate: '', catches: '', runOuts: '' }); };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormTypeChange = (type: 'BATTING' | 'BOWLING') => setFormType(type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Compose stats object
      const stats: any = {};
      if (formType === 'BATTING') {
        stats.runs = Number(form.runs);
        stats.balls = Number(form.balls);
        stats.fours = Number(form.fours);
        stats.sixes = Number(form.sixes);
        stats.strikeRate = stats.balls ? (stats.runs / stats.balls) * 100 : 0;
      } else if (formType === 'BOWLING') {
        stats.wickets = Number(form.wickets);
        stats.overs = Number(form.overs);
        stats.economyRate = Number(form.economyRate);
      }
      stats.catches = Number(form.catches);
      stats.runOuts = Number(form.runOuts);
      // POST to /api/matches
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          matchName: form.matchName,
          opponent: form.opponent,
          venue: form.venue,
          matchDate: form.matchDate,
          sport: 'CRICKET',
          matchType: form.matchType,
          result: form.result,
          position: form.position,
          stats,
          rating: form.rating ? Number(form.rating) : undefined,
        })
      });
      if (!res.ok) throw new Error('Failed to add match');
      handleCloseAddModal();
      // Refresh matches
      setLoading(true);
      const refreshed = await fetch('/api/matches');
      setMatches(await refreshed.json());
    } catch (err) {
      alert('Failed to add match score.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine matches to display
  const displayedMatches = isExpanded ? matches : matches.slice(0, PREVIEW_COUNT);
  const hasMoreMatches = matches.length > PREVIEW_COUNT;

  // Get student name for coach view
  const studentName = isCoachView && matches.length > 0 ? matches[0].student.studentName : null;

  // Debug: log session
  if (typeof window !== 'undefined') {
    console.log('RecentMatchScores session:', session, 'status:', sessionStatus);
    if (session?.user) {
      console.log('RecentMatchScores session.user:', session.user);
      if (!('role' in session.user)) {
        console.warn('RecentMatchScores: session.user.role is missing!', session.user);
      }
    }
  }

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
          {/* '+' button for athletes only */}
          {sessionStatus === 'loading' ? null : session?.user?.role === 'ATHLETE' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              title="Add Match Score"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
        {/* Placeholder content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Recent Matches</h3>
            <p className="text-gray-500">Match scores will appear here once data is added.</p>
          </div>
        </div>
        {/* Add Match Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={handleCloseAddModal}
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Add Match Performance</h3>
              <div className="flex space-x-2 mb-4">
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${formType === 'BATTING' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleFormTypeChange('BATTING')}
                  type="button"
                >Batting</button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${formType === 'BOWLING' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleFormTypeChange('BOWLING')}
                  type="button"
                >Bowling</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="matchName" value={form.matchName} onChange={handleFormChange} required placeholder="Match Name" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  <input name="opponent" value={form.opponent} onChange={handleFormChange} required placeholder="Opponent" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  <input name="venue" value={form.venue} onChange={handleFormChange} placeholder="Venue" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  <input name="matchDate" value={form.matchDate} onChange={handleFormChange} required type="date" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  <select name="matchType" value={form.matchType} onChange={handleFormChange} className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500">
                    <option value="PRACTICE">Practice</option>
                    <option value="FRIENDLY">Friendly</option>
                    <option value="LEAGUE">League</option>
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="CHAMPIONSHIP">Championship</option>
                  </select>
                  <select name="result" value={form.result} onChange={handleFormChange} className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500">
                    <option value="">Result</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="DRAW">Draw</option>
                    <option value="ABANDONED">Abandoned</option>
                  </select>
                  <input name="position" value={form.position} onChange={handleFormChange} placeholder="Position" className="border rounded px-3 py-2 col-span-2 text-gray-800 placeholder-gray-500" />
                </div>
                {formType === 'BATTING' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input name="runs" value={form.runs} onChange={handleFormChange} required placeholder="Runs" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                    <input name="balls" value={form.balls} onChange={handleFormChange} required placeholder="Balls" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                    <input name="fours" value={form.fours} onChange={handleFormChange} placeholder="Fours" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                    <input name="sixes" value={form.sixes} onChange={handleFormChange} placeholder="Sixes" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  </div>
                )}
                {formType === 'BOWLING' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input name="wickets" value={form.wickets} onChange={handleFormChange} required placeholder="Wickets" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                    <input name="overs" value={form.overs} onChange={handleFormChange} required placeholder="Overs" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                    <input name="economyRate" value={form.economyRate} onChange={handleFormChange} placeholder="Economy Rate" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input name="catches" value={form.catches} onChange={handleFormChange} placeholder="Catches" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                  <input name="runOuts" value={form.runOuts} onChange={handleFormChange} placeholder="Run Outs" type="number" className="border rounded px-3 py-2 text-gray-800 placeholder-gray-500" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 mt-2">
                  {submitting ? 'Saving...' : 'Save Match Score'}
                </button>
              </form>
            </div>
          </div>
        )}
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
            {isCoachView && studentName && (
              <p className="text-gray-700 font-medium">for <span className="text-indigo-700">{studentName}</span></p>
            )}
            <p className="text-gray-600">
              {isExpanded 
                ? `Showing all ${matches.length} match performances` 
                : `Latest ${Math.min(matches.length, PREVIEW_COUNT)} of ${matches.length} matches`
              }
            </p>
          </div>
        </div>
        {/* '+' button for athletes only, always top right */}
        {!isCoachView && sessionStatus !== 'loading' && session?.user?.role === 'ATHLETE' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ml-auto"
            title="Add Match Score"
            style={{ marginLeft: 'auto' }}
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Match Cards */}
      <div className="grid gap-6">
        {displayedMatches.map((performance) => (
          <div key={performance.id}>
            <div onClick={() => { setSelectedMatch(performance); setShowDetailsModal(true); }} className="cursor-pointer">
              <MatchCard performance={performance} />
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowDetailsModal(false); setSelectedMatch(null); }}
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-indigo-700 mb-1">{selectedMatch.match.matchName}</h3>
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(selectedMatch.match.matchDate).toLocaleDateString()}</span>
                <MapPin className="h-4 w-4 ml-4" />
                <span>{selectedMatch.match.venue}</span>
                <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${MatchTypeColors[selectedMatch.match.matchType as keyof typeof MatchTypeColors]}`}>{selectedMatch.match.matchType}</span>
                {selectedMatch.match.result && (
                  <span className={`ml-4 px-2 py-1 rounded text-xs font-medium border ${ResultColors[selectedMatch.match.result as keyof typeof ResultColors]}`}>{selectedMatch.match.result}</span>
                )}
              </div>
              <div className="text-gray-700 text-sm mb-2">vs {selectedMatch.match.opponent}</div>
              {selectedMatch.position && (
                <div className="text-gray-600 text-sm mb-2">Position: {selectedMatch.position}</div>
              )}
            </div>
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {(() => {
                const stats: MatchStats = JSON.parse(selectedMatch.stats || '{}');
                return (
                  <>
                    {typeof stats.runs === 'number' && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.runs}</div>
                        <div className="text-xs text-indigo-500">Runs</div>
                      </div>
                    )}
                    {typeof stats.balls === 'number' && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.balls}</div>
                        <div className="text-xs text-indigo-500">Balls</div>
                      </div>
                    )}
                    {typeof stats.strikeRate === 'number' && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.strikeRate.toFixed(1)}</div>
                        <div className="text-xs text-indigo-500">Strike Rate</div>
                      </div>
                    )}
                    {typeof stats.fours === 'number' && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.fours}</div>
                        <div className="text-xs text-indigo-500">Fours</div>
                      </div>
                    )}
                    {typeof stats.sixes === 'number' && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.sixes}</div>
                        <div className="text-xs text-indigo-500">Sixes</div>
                      </div>
                    )}
                    {typeof stats.wickets === 'number' && (
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.wickets}</div>
                        <div className="text-xs text-green-500">Wickets</div>
                      </div>
                    )}
                    {typeof stats.overs === 'number' && (
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.overs}</div>
                        <div className="text-xs text-green-500">Overs</div>
                      </div>
                    )}
                    {typeof stats.economyRate === 'number' && (
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.economyRate}</div>
                        <div className="text-xs text-green-500">Economy Rate</div>
                      </div>
                    )}
                    {typeof stats.catches === 'number' && (
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{stats.catches}</div>
                        <div className="text-xs text-yellow-500">Catches</div>
                      </div>
                    )}
                    {typeof stats.runOuts === 'number' && (
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{stats.runOuts}</div>
                        <div className="text-xs text-yellow-500">Run Outs</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            {/* Notes */}
            {selectedMatch.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Coach Notes</span>
                </div>
                <p className="text-sm text-gray-600">{selectedMatch.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 