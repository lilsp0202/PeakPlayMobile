"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, MapPin, Trophy, User, Star, FileText, Target, Loader2 } from 'lucide-react';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (matchData: any) => Promise<void>;
  match: any;
  role: string;
}

export default function EditMatchModal({ isOpen, onClose, onSubmit, match, role }: EditMatchModalProps) {
  const [formData, setFormData] = useState({
    matchName: '',
    opponent: '',
    venue: '',
    matchDate: '',
    sport: 'CRICKET',
    matchType: 'PRACTICE',
    result: 'WIN',
    position: '',
    stats: {},
    rating: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (match) {
      let existingStats = {};
      try {
        existingStats = typeof match.stats === 'string' ? JSON.parse(match.stats) : match.stats || {};
      } catch (e) {
        console.error('Error parsing existing stats:', e);
        existingStats = {};
      }

      setFormData({
        matchName: match.match.matchName || '',
        opponent: match.match.opponent || '',
        venue: match.match.venue || '',
        matchDate: match.match.matchDate ? new Date(match.match.matchDate).toISOString().split('T')[0] : '',
        sport: match.match.sport || 'CRICKET',
        matchType: match.match.matchType || 'PRACTICE',
        result: match.match.result || 'WIN',
        position: match.position || '',
        stats: existingStats,
        rating: match.rating?.toString() || '',
        notes: match.notes || '',
      });
    }
  }, [match]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.matchName.trim()) {
      newErrors.matchName = 'Match name is required';
    }
    if (!formData.opponent.trim()) {
      newErrors.opponent = 'Opponent is required';
    }
    if (!formData.matchDate) {
      newErrors.matchDate = 'Match date is required';
    }
    if (formData.rating && (isNaN(parseFloat(formData.rating)) || parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 10)) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        stats: formData.stats,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      });
    } catch (error) {
      console.error('Error updating match:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStats = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: value
      }
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Match Performance</h2>
                  <p className="text-sm text-gray-600">Update your match details and statistics</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Match Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Match Name *
                    </label>
                    <input
                      type="text"
                      value={formData.matchName}
                      onChange={(e) => setFormData(prev => ({ ...prev, matchName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., League Match vs Mumbai"
                    />
                    {errors.matchName && <p className="text-red-500 text-sm mt-1">{errors.matchName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opponent *
                    </label>
                    <input
                      type="text"
                      value={formData.opponent}
                      onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Mumbai Indians"
                    />
                    {errors.opponent && <p className="text-red-500 text-sm mt-1">{errors.opponent}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Venue
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Wankhede Stadium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Match Date *
                    </label>
                    <input
                      type="date"
                      value={formData.matchDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.matchDate && <p className="text-red-500 text-sm mt-1">{errors.matchDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Match Type
                    </label>
                    <select
                      value={formData.matchType}
                      onChange={(e) => setFormData(prev => ({ ...prev, matchType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="PRACTICE">Practice</option>
                      <option value="FRIENDLY">Friendly</option>
                      <option value="LEAGUE">League</option>
                      <option value="TOURNAMENT">Tournament</option>
                      <option value="FINAL">Final</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result
                    </label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="WIN">Win</option>
                      <option value="LOSS">Loss</option>
                      <option value="DRAW">Draw</option>
                      <option value="NO_RESULT">No Result</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Match
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
