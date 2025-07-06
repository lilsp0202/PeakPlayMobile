"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAward, FiPlus, FiTrash2 } from "react-icons/fi";

interface CreateBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBadgeCreated: () => void;
}

interface BadgeRule {
  id: string;
  fieldName: string;
  operator: string;
  value: string;
  description: string;
}

const skillFields = [
  // Physical Skills
  { value: 'pushupScore', label: 'Push-up Score', type: 'number' },
  { value: 'pullupScore', label: 'Pull-up Score', type: 'number' },
  { value: 'verticalJump', label: 'Vertical Jump (cm)', type: 'number' },
  { value: 'gripStrength', label: 'Grip Strength (kg)', type: 'number' },
  { value: 'sprint50m', label: '50m Sprint Time (sec)', type: 'number' },
  { value: 'shuttleRun', label: 'Shuttle Run Time (sec)', type: 'number' },
  { value: 'run5kTime', label: '5K Run Time (min)', type: 'number' },
  { value: 'yoyoTest', label: 'Yo-Yo Test Level', type: 'number' },
  
  // Technical Skills
  { value: 'battingStance', label: 'Batting Stance', type: 'number' },
  { value: 'battingGrip', label: 'Batting Grip', type: 'number' },
  { value: 'battingBalance', label: 'Batting Balance', type: 'number' },
  { value: 'bowlingGrip', label: 'Bowling Grip', type: 'number' },
  { value: 'flatCatch', label: 'Flat Catch', type: 'number' },
  { value: 'highCatch', label: 'High Catch', type: 'number' },
  { value: 'throw', label: 'Throwing', type: 'number' },
  
  // Wellness
  { value: 'sleepScore', label: 'Sleep Score', type: 'number' },
  { value: 'waterIntake', label: 'Water Intake (L)', type: 'number' },
  { value: 'moodScore', label: 'Mood Score', type: 'number' },
  { value: 'protein', label: 'Protein Intake (g)', type: 'number' },
  { value: 'totalCalories', label: 'Total Calories', type: 'number' },
];

const operators = [
  { value: 'gte', label: 'Greater than or equal to' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lte', label: 'Less than or equal to' },
  { value: 'lt', label: 'Less than' },
  { value: 'eq', label: 'Equal to' },
];

const badgeIcons = ['🏆', '⭐', '🎯', '💪', '🔥', '🚀', '🏅', '✨', '🎖️', '🌟', '👑', '💯'];

export default function CreateBadgeModal({ isOpen, onClose, onBadgeCreated }: CreateBadgeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    motivationalText: '',
    level: 'BRONZE',
    categoryId: '',
    icon: '🏆',
    sport: 'CRICKET'
  });
  
  const [rules, setRules] = useState<BadgeRule[]>([{
    id: Date.now().toString(),
    fieldName: 'pushupScore',
    operator: 'gte',
    value: '10',
    description: ''
  }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRuleChange = (id: string, field: string, value: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const addRule = () => {
    setRules(prev => [...prev, {
      id: Date.now().toString(),
      fieldName: 'pushupScore',
      operator: 'gte',
      value: '10',
      description: ''
    }]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/badges/coach-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badge: formData,
          rules: rules.map(rule => ({
            ruleType: 'SKILL',
            fieldName: rule.fieldName,
            operator: rule.operator.toUpperCase(),
            value: rule.value,
            description: rule.description || `${rule.fieldName} ${rule.operator} ${rule.value}`,
            isRequired: true,
            weight: 1
          }))
        }),
      });

      if (response.ok) {
        onBadgeCreated();
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          motivationalText: '',
          level: 'BRONZE',
          categoryId: '',
          icon: '🏆',
          sport: 'CRICKET'
        });
        setRules([{
          id: Date.now().toString(),
          fieldName: 'pushupScore',
          operator: 'gte',
          value: '10',
          description: ''
        }]);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create badge');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl max-w-4xl w-full min-h-0 max-h-[100vh] sm:max-h-[90vh] overflow-hidden shadow-2xl my-2 sm:my-4 flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiAward className="text-yellow-600" />
                  Create Custom Badge
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Design a unique badge for your students
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter badge name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Icon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
                  {badgeIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Brief description of what this badge represents"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none text-gray-900 font-medium placeholder-gray-400 text-base"
                  required
                />
              </div>

              {/* Motivational Text */}
              <div>
                <label htmlFor="motivationalText" className="block text-sm font-medium text-gray-700 mb-2">
                  Motivational Text
                </label>
                <input
                  type="text"
                  id="motivationalText"
                  name="motivationalText"
                  value={formData.motivationalText}
                  onChange={handleInputChange}
                  placeholder="e.g., Keep pushing your limits!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-gray-900 font-medium placeholder-gray-400 text-base"
                />
              </div>

              {/* Badge Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Achievement Rules
                  </label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Rule
                  </button>
                </div>
                
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Skill
                          </label>
                          <select
                            value={rule.fieldName}
                            onChange={(e) => handleRuleChange(rule.id, 'fieldName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium bg-white"
                          >
                            {skillFields.map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Condition
                          </label>
                          <select
                            value={rule.operator}
                            onChange={(e) => handleRuleChange(rule.id, 'operator', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium bg-white"
                          >
                            {operators.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Value
                          </label>
                          <input
                            type="number"
                            value={rule.value}
                            onChange={(e) => handleRuleChange(rule.id, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium"
                            required
                          />
                        </div>
                        
                        <div className="flex items-end">
                          {rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {index < rules.length - 1 && (
                        <div className="mt-3 text-center text-xs text-gray-500 font-medium">
                          AND
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-600 mt-2">
                  All rules must be met for the badge to be awarded
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Badge'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 