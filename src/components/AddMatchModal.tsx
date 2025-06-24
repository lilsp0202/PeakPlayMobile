"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Trophy, Star, Target, Plus, Shield, Users, BarChart2 } from "lucide-react";

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (matchData: any) => Promise<void>;
  role?: string;
}

interface MatchStats {
  // Batting stats
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dots: number;
  notOut: boolean;
  strikeRate?: number;
  // Bowling stats
  wickets: number;
  overs: number;
  maidens: number;
  wides: number;
  noBalls: number;
  economyRate?: number;
  // Fielding stats
  catches: number;
  runOuts: number;
  stumpings: number;
}

export default function AddMatchModal({ isOpen, onClose, onSubmit, role = "BATSMAN" }: AddMatchModalProps) {
  const [formData, setFormData] = useState({
    matchName: "",
    opponent: "",
    venue: "",
    matchDate: new Date().toISOString().split("T")[0],
    matchType: "PRACTICE",
    result: "WIN",
    stats: {
      // Batting stats
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dots: 0,
      notOut: false,
      // Bowling stats
      wickets: 0,
      overs: 0,
      maidens: 0,
      wides: 0,
      noBalls: 0,
      // Fielding stats
      catches: 0,
      runOuts: 0,
      stumpings: 0,
    } as MatchStats,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate derived statistics
      const stats = { ...formData.stats } as MatchStats;
      
      // Calculate batting stats
      if (stats.balls > 0) {
        stats.strikeRate = Number(((stats.runs / stats.balls) * 100).toFixed(2));
      }
      
      // Calculate bowling stats
      if (stats.overs > 0) {
        stats.economyRate = Number((stats.runs / stats.overs).toFixed(2));
      }
      
      const matchData = {
        matchName: formData.matchName,
        opponent: formData.opponent,
        venue: formData.venue || "",
        matchDate: formData.matchDate,
        sport: "CRICKET",
        matchType: formData.matchType,
        result: formData.result,
        position: role || "Player",
        stats: stats,
        rating: 7.0, // Default rating
        notes: `Performance in ${formData.matchName} vs ${formData.opponent}`
      };
      
      console.log("AddMatchModal - Submitting match data:", matchData);
      await onSubmit(matchData);
      
      // Reset form on successful submission
      setFormData({
        matchName: "",
        opponent: "",
        venue: "",
        matchDate: new Date().toISOString().split("T")[0],
        matchType: "PRACTICE",
        result: "WIN",
        stats: {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          dots: 0,
          notOut: false,
          wickets: 0,
          overs: 0,
          maidens: 0,
          wides: 0,
          noBalls: 0,
          catches: 0,
          runOuts: 0,
          stumpings: 0,
        } as MatchStats,
      });
      
      onClose();
    } catch (error) {
      console.error("AddMatchModal - Error submitting match:", error);
      // Don't close modal on error so user can retry
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("stats.")) {
      const statName = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: type === "checkbox" ? (e.target as HTMLInputElement).checked : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  const isBatsman = role === "BATSMAN" || role === "ALL_ROUNDER";
  const isBowler = role === "BOWLER" || role === "ALL_ROUNDER";
  const isKeeper = role === "KEEPER";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Match Performance</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Match Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-indigo-500" />
                Match Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Name</label>
                  <input
                    type="text"
                    name="matchName"
                    value={formData.matchName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
                  <input
                    type="text"
                    name="opponent"
                    value={formData.opponent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Date</label>
                  <input
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                  <select
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="PRACTICE">Practice</option>
                    <option value="FRIENDLY">Friendly</option>
                    <option value="LEAGUE">League</option>
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="CHAMPIONSHIP">Championship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  <select
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="DRAW">Draw</option>
                    <option value="ABANDONED">Abandoned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-6">
              {isBatsman && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
                    Batting Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runs</label>
                      <input
                        type="number"
                        name="stats.runs"
                        value={formData.stats.runs}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balls Faced</label>
                      <input
                        type="number"
                        name="stats.balls"
                        value={formData.stats.balls}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">4s</label>
                      <input
                        type="number"
                        name="stats.fours"
                        value={formData.stats.fours}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">6s</label>
                      <input
                        type="number"
                        name="stats.sixes"
                        value={formData.stats.sixes}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dot Balls</label>
                      <input
                        type="number"
                        name="stats.dots"
                        value={formData.stats.dots}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="stats.notOut"
                          checked={formData.stats.notOut}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Not Out</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {isBowler && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <BarChart2 className="w-5 h-5 mr-2 text-teal-500" />
                    Bowling Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wickets</label>
                      <input
                        type="number"
                        name="stats.wickets"
                        value={formData.stats.wickets}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overs</label>
                      <input
                        type="number"
                        name="stats.overs"
                        value={formData.stats.overs}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maidens</label>
                      <input
                        type="number"
                        name="stats.maidens"
                        value={formData.stats.maidens}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wides</label>
                      <input
                        type="number"
                        name="stats.wides"
                        value={formData.stats.wides}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No Balls</label>
                      <input
                        type="number"
                        name="stats.noBalls"
                        value={formData.stats.noBalls}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <BarChart2 className="w-5 h-5 mr-2 text-orange-500" />
                  Fielding Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catches</label>
                    <input
                      type="number"
                      name="stats.catches"
                      value={formData.stats.catches}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Run Outs</label>
                    <input
                      type="number"
                      name="stats.runOuts"
                      value={formData.stats.runOuts}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  {isKeeper && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stumpings</label>
                      <input
                        type="number"
                        name="stats.stumpings"
                        value={formData.stats.stumpings}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Match
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 