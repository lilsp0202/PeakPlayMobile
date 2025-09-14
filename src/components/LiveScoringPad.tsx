'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Users,
  Trophy,
  Target,
  Activity,
  Clock,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface Ball {
  id: string;
  overNumber: number;
  ballNumber: number;
  runs: number;
  extras: {
    wide: number;
    noBall: number;
    bye: number;
    legBye: number;
  };
  wicket?: {
    type: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';
    batsmanOut: string;
    fielder?: string;
  };
  isBoundary?: '4' | '6';
  timestamp: Date;
}

interface Batsman {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOnStrike: boolean;
}

interface Bowler {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economyRate: number;
  wides: number;
  noBalls: number;
}

interface MatchState {
  teamA: {
    name: string;
    totalRuns: number;
    wickets: number;
    overs: number;
    balls: number;
    extras: number;
  };
  teamB: {
    name: string;
    totalRuns: number;
    wickets: number;
    overs: number;
    balls: number;
    extras: number;
  };
  currentInnings: 1 | 2;
  currentBatsmen: [Batsman, Batsman];
  currentBowler: Bowler;
  recentBalls: Ball[];
  target?: number;
  matchType: 'T20' | 'ODI' | 'TEST';
  totalOvers: number;
}

export default function LiveScoringPad() {
  const { data: session } = useSession();
  const [matchState, setMatchState] = useState<MatchState>({
    teamA: {
      name: 'Team A',
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0
    },
    teamB: {
      name: 'Team B',
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0
    },
    currentInnings: 1,
    currentBatsmen: [
      { id: '1', name: 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOnStrike: true },
      { id: '2', name: 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOnStrike: false }
    ],
    currentBowler: { id: '1', name: 'Bowler 1', overs: 0, maidens: 0, runs: 0, wickets: 0, economyRate: 0, wides: 0, noBalls: 0 },
    recentBalls: [],
    matchType: 'T20',
    totalOvers: 20
  });

  const [selectedRuns, setSelectedRuns] = useState<number>(0);
  const [selectedExtras, setSelectedExtras] = useState<{ wide: number; noBall: number; bye: number; legBye: number }>({
    wide: 0,
    noBall: 0,
    bye: 0,
    legBye: 0
  });
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState<string>('bowled');

  const currentTeam = matchState.currentInnings === 1 ? matchState.teamA : matchState.teamB;
  const striker = matchState.currentBatsmen.find(b => b.isOnStrike)!;
  const nonStriker = matchState.currentBatsmen.find(b => !b.isOnStrike)!;

  const handleBallDelivery = () => {
    // Calculate total runs for this ball
    const totalExtras = selectedExtras.wide + selectedExtras.noBall + selectedExtras.bye + selectedExtras.legBye;
    const runsFromBall = selectedRuns + totalExtras;

    // Create new ball entry
    const newBall: Ball = {
      id: Date.now().toString(),
      overNumber: Math.floor(currentTeam.balls / 6) + 1,
      ballNumber: (currentTeam.balls % 6) + 1,
      runs: selectedRuns,
      extras: selectedExtras,
      wicket: isWicket ? { type: wicketType as any, batsmanOut: striker.name } : undefined,
      isBoundary: selectedRuns === 4 ? '4' : selectedRuns === 6 ? '6' : undefined,
      timestamp: new Date()
    };

    // Update match state
    setMatchState(prev => {
      const newState = { ...prev };
      const team = newState.currentInnings === 1 ? newState.teamA : newState.teamB;
      
      // Update team score
      team.totalRuns += runsFromBall;
      team.extras += totalExtras;
      
      // Update balls (don't count wides/no-balls as legal deliveries)
      if (selectedExtras.wide === 0 && selectedExtras.noBall === 0) {
        team.balls += 1;
        team.overs = Math.floor(team.balls / 6) + (team.balls % 6) / 10;
      }

      // Update batsman stats
      const strikerIndex = newState.currentBatsmen.findIndex(b => b.isOnStrike);
      if (strikerIndex !== -1) {
        const batsman = newState.currentBatsmen[strikerIndex];
        batsman.runs += selectedRuns;
        if (selectedExtras.wide === 0) {
          batsman.balls += 1;
        }
        if (selectedRuns === 4) batsman.fours += 1;
        if (selectedRuns === 6) batsman.sixes += 1;
        batsman.strikeRate = batsman.balls > 0 ? (batsman.runs / batsman.balls) * 100 : 0;
      }

      // Update bowler stats
      newState.currentBowler.runs += runsFromBall;
      if (selectedExtras.wide > 0) newState.currentBowler.wides += 1;
      if (selectedExtras.noBall > 0) newState.currentBowler.noBalls += 1;
      if (selectedExtras.wide === 0 && selectedExtras.noBall === 0) {
        const ballsInOver = team.balls % 6;
        if (ballsInOver === 0) {
          newState.currentBowler.overs += 1;
        }
      }
      if (isWicket) {
        team.wickets += 1;
        newState.currentBowler.wickets += 1;
      }
      
      // Calculate economy rate
      const totalBalls = newState.currentBowler.overs * 6 + (team.balls % 6);
      if (totalBalls > 0) {
        newState.currentBowler.economyRate = (newState.currentBowler.runs / totalBalls) * 6;
      }

      // Switch strike if odd runs or end of over
      if ((selectedRuns % 2 === 1) || (team.balls % 6 === 0 && team.balls > 0)) {
        newState.currentBatsmen[0].isOnStrike = !newState.currentBatsmen[0].isOnStrike;
        newState.currentBatsmen[1].isOnStrike = !newState.currentBatsmen[1].isOnStrike;
      }

      // Add ball to recent balls
      newState.recentBalls = [newBall, ...newState.recentBalls.slice(0, 29)];

      return newState;
    });

    // Reset selections
    setSelectedRuns(0);
    setSelectedExtras({ wide: 0, noBall: 0, bye: 0, legBye: 0 });
    setIsWicket(false);
    setWicketType('bowled');
  };

  const getRunRate = () => {
    if (currentTeam.overs === 0) return '0.00';
    const totalBalls = currentTeam.balls;
    if (totalBalls === 0) return '0.00';
    return (currentTeam.totalRuns / (totalBalls / 6)).toFixed(2);
  };

  const getRequiredRunRate = () => {
    if (!matchState.target || matchState.currentInnings === 1) return null;
    const runsNeeded = matchState.target - currentTeam.totalRuns;
    const ballsRemaining = (matchState.totalOvers * 6) - currentTeam.balls;
    if (ballsRemaining <= 0) return null;
    return ((runsNeeded / ballsRemaining) * 6).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Live Cricket Scoring</h1>
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>

        {/* Match Info */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {currentTeam.name} - Innings {matchState.currentInnings}
              </h2>
              <div className="text-3xl font-bold text-indigo-600">
                {currentTeam.totalRuns}/{currentTeam.wickets}
              </div>
              <div className="text-sm text-gray-600">
                Overs: {Math.floor(currentTeam.balls / 6)}.{currentTeam.balls % 6} / {matchState.totalOvers}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-600">Run Rate</div>
              <div className="text-2xl font-semibold text-gray-900">{getRunRate()}</div>
              {getRequiredRunRate() && (
                <>
                  <div className="text-sm text-gray-600 mt-2">Required RR</div>
                  <div className="text-2xl font-semibold text-green-600">{getRequiredRunRate()}</div>
                </>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-600">Extras</div>
              <div className="text-xl font-semibold text-gray-900">{currentTeam.extras}</div>
            </div>
          </div>
        </div>

        {/* Batsmen Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className={`bg-gray-800 rounded-xl shadow-sm p-4 ${striker.isOnStrike ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{striker.name} *</h3>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{striker.runs}</div>
                <div className="text-xs text-gray-600">Runs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{striker.balls}</div>
                <div className="text-xs text-gray-600">Balls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{striker.strikeRate.toFixed(1)}</div>
                <div className="text-xs text-gray-600">SR</div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span>4s: {striker.fours}</span>
              <span>6s: {striker.sixes}</span>
            </div>
          </div>

          <div className={`bg-gray-800 rounded-xl shadow-sm p-4 ${nonStriker.isOnStrike ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{nonStriker.name}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{nonStriker.runs}</div>
                <div className="text-xs text-gray-600">Runs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{nonStriker.balls}</div>
                <div className="text-xs text-gray-600">Balls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{nonStriker.strikeRate.toFixed(1)}</div>
                <div className="text-xs text-gray-600">SR</div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span>4s: {nonStriker.fours}</span>
              <span>6s: {nonStriker.sixes}</span>
            </div>
          </div>
        </div>

        {/* Bowler Stats */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{matchState.currentBowler.name}</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {matchState.currentBowler.overs}.{currentTeam.balls % 6}
              </div>
              <div className="text-xs text-gray-600">Overs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{matchState.currentBowler.runs}</div>
              <div className="text-xs text-gray-600">Runs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{matchState.currentBowler.wickets}</div>
              <div className="text-xs text-gray-600">Wickets</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{matchState.currentBowler.economyRate.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Econ</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{matchState.currentBowler.maidens}</div>
              <div className="text-xs text-gray-600">Maidens</div>
            </div>
          </div>
        </div>

        {/* Scoring Controls */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score This Ball</h3>
          
          {/* Runs Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Runs</h4>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(run => (
                <button
                  key={run}
                  onClick={() => setSelectedRuns(run)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                                         selectedRuns === run
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                  }`
                >
                  {run}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Extras</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedExtras(prev => ({ ...prev, wide: prev.wide ? 0 : 1 }))}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedExtras.wide > 0
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                Wide
              </button>
              <button
                onClick={() => setSelectedExtras(prev => ({ ...prev, noBall: prev.noBall ? 0 : 1 }))}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedExtras.noBall > 0
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                No Ball
              </button>
              <button
                onClick={() => setSelectedExtras(prev => ({ ...prev, bye: prev.bye ? 0 : selectedRuns }))}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedExtras.bye > 0
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                Bye
              </button>
              <button
                onClick={() => setSelectedExtras(prev => ({ ...prev, legBye: prev.legBye ? 0 : selectedRuns }))}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedExtras.legBye > 0
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                Leg Bye
              </button>
            </div>
          </div>

          {/* Wicket */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Wicket</h4>
            <div className="space-y-2">
              <button
                onClick={() => setIsWicket(!isWicket)}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  isWicket
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isWicket ? 'Wicket!' : 'No Wicket'}
              </button>
              {isWicket && (
                <select
                  value={wicketType}
                  onChange={(e) => setWicketType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="runout">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hitwicket">Hit Wicket</option>
                </select>
              )}
            </div>
          </div>

          {/* Submit Ball */}
                     <button
            onClick={handleBallDelivery}
            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Record Ball
          </button>
        </div>

        {/* Recent Balls */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">This Over</h3>
          <div className="flex gap-2 flex-wrap">
            {matchState.recentBalls
              .filter(ball => ball.overNumber === Math.floor(currentTeam.balls / 6) + 1)
              .map(ball => (
                <div
                  key={ball.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    ball.wicket ? 'bg-red-500 text-white' :
                    ball.isBoundary === '6' ? 'bg-green-500 text-white' :
                    ball.isBoundary === '4' ? 'bg-blue-500 text-white' :
                    ball.extras.wide > 0 || ball.extras.noBall > 0 ? 'bg-yellow-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}
                >
                  {ball.wicket ? 'W' :
                   ball.extras.wide > 0 ? 'Wd' :
                   ball.extras.noBall > 0 ? 'Nb' :
                   ball.runs}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 