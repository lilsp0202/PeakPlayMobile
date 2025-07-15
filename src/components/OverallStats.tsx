import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Award, Shield, Activity } from 'lucide-react';

interface MatchPerformance {
  id: string;
  stats: string;
}

interface AggregatedStats {
  batting: {
    totalRuns: number;
    innings: number;
    outs: number;
    highest: number;
    average: number;
    strikeRate: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    wickets: number;
    overs: number;
    runsConceded: number;
    maidens: number;
    average: number;
    economy: number;
    best: string;
  };
  fielding: {
    catches: number;
    runOuts: number;
    stumpings: number;
    dismissals: number;
    matches: number;
  };
}

function aggregateStats(performances: MatchPerformance[]): AggregatedStats {
  let batting = {
    totalRuns: 0,
    innings: 0,
    outs: 0,
    highest: 0,
    average: 0,
    strikeRate: 0,
    fours: 0,
    sixes: 0,
  };
  let bowling = {
    wickets: 0,
    overs: 0,
    runsConceded: 0,
    maidens: 0,
    average: 0,
    economy: 0,
    best: '',
  };
  let fielding = {
    catches: 0,
    runOuts: 0,
    stumpings: 0,
    dismissals: 0,
    matches: performances.length,
  };
  let bestWickets = 0;
  let bestRuns = 9999;
  let totalBalls = 0;
  let totalBatBalls = 0;
  performances.forEach((perf) => {
    let stats: any = {};
    try { stats = typeof perf.stats === 'string' ? JSON.parse(perf.stats) : perf.stats; } catch {}
    // Batting
    if (stats.runs !== undefined) {
      batting.totalRuns += stats.runs;
      batting.innings += 1;
      batting.highest = Math.max(batting.highest, stats.runs);
      if (!stats.notOut) batting.outs += 1;
      if (stats.balls) {
        totalBatBalls += stats.balls;
      }
      if (stats.fours) batting.fours += stats.fours;
      if (stats.sixes) batting.sixes += stats.sixes;
    }
    // Bowling
    if (stats.wickets !== undefined) {
      bowling.wickets += stats.wickets;
      if (stats.overs) {
        bowling.overs += stats.overs;
        totalBalls += Math.round(stats.overs * 6);
      }
      if (stats.runsConceded !== undefined) bowling.runsConceded += stats.runsConceded;
      if (stats.maidens) bowling.maidens += stats.maidens;
      if (stats.wickets > bestWickets || (stats.wickets === bestWickets && stats.runsConceded < bestRuns)) {
        bestWickets = stats.wickets;
        bestRuns = stats.runsConceded;
        bowling.best = `${stats.wickets}/${stats.runsConceded}`;
      }
    }
    // Fielding
    if (stats.catches) fielding.catches += stats.catches;
    if (stats.runOuts) fielding.runOuts += stats.runOuts;
    if (stats.stumpings) fielding.stumpings += stats.stumpings;
  });
  // Batting averages
  batting.average = batting.outs > 0 ? +(batting.totalRuns / batting.outs).toFixed(2) : batting.totalRuns;
  batting.strikeRate = totalBatBalls > 0 ? +((batting.totalRuns / totalBatBalls) * 100).toFixed(2) : 0;
  // Bowling averages
  bowling.average = bowling.wickets > 0 ? +(bowling.runsConceded / bowling.wickets).toFixed(2) : 0;
  bowling.economy = totalBalls > 0 ? +((bowling.runsConceded / (totalBalls / 6))).toFixed(2) : 0;
  // Fielding
  fielding.dismissals = fielding.catches + fielding.runOuts + fielding.stumpings;
  return { batting, bowling, fielding };
}

interface SkillsData {
  mental: number;
  nutrition: number;
  physical: number;
  technical: number;
}

interface OverallStatsProps {
  skillsData?: SkillsData;
}

export default function OverallStats({ skillsData }: OverallStatsProps = {}) {
  const [performances, setPerformances] = useState<MatchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AggregatedStats | null>(null);

  useEffect(() => {
    const fetchPerformances = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        setPerformances(data);
        setStats(aggregateStats(data));
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformances();
  }, []);

  if (loading || !stats) return <div className="text-center py-8 text-gray-500">Loading stats...</div>;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Batting Stats */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <BarChart2 className="w-6 h-6 text-indigo-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Batting Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Runs" value={stats.batting.totalRuns} />
          <StatCard label="Innings" value={stats.batting.innings} />
          <StatCard label="Highest Score" value={stats.batting.highest} />
          <StatCard label="Average" value={stats.batting.average} />
          <StatCard label="Strike Rate" value={stats.batting.strikeRate} />
          <StatCard label="4s / 6s" value={`${stats.batting.fours} / ${stats.batting.sixes}`} />
        </div>
      </motion.div>
      {/* Bowling Stats */}
      <motion.div
        className="bg-gradient-to-r from-cyan-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <Award className="w-6 h-6 text-cyan-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Bowling Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Wickets" value={stats.bowling.wickets} />
          <StatCard label="Overs" value={stats.bowling.overs} />
          <StatCard label="Runs Conceded" value={stats.bowling.runsConceded} />
          <StatCard label="Average" value={stats.bowling.average} />
          <StatCard label="Economy" value={stats.bowling.economy} />
          <StatCard label="Best" value={stats.bowling.best} />
        </div>
      </motion.div>
      {/* Fielding Stats */}
      <motion.div
        className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Fielding Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Catches" value={stats.fielding.catches} />
          <StatCard label="Run Outs" value={stats.fielding.runOuts} />
          <StatCard label="Stumpings" value={stats.fielding.stumpings} />
          <StatCard label="Dismissals" value={stats.fielding.dismissals} />
          <StatCard label="Matches" value={stats.fielding.matches} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center"
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">{label}</div>
    </motion.div>
  );
} 