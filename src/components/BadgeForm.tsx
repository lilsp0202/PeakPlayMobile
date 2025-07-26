"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Award, Star, Target, TrendingUp, Activity, Zap, Shield, Crown, Medal, Gem } from "lucide-react";

interface BadgeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBadgeCreated: () => void;
  editingBadge?: any;
}

const ICON_OPTIONS = [
  { value: 'trophy', label: 'Trophy', icon: Trophy },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'trending', label: 'Trending Up', icon: TrendingUp },
  { value: 'activity', label: 'Activity', icon: Activity },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'medal', label: 'Medal', icon: Medal },
  { value: 'gem', label: 'Gem', icon: Gem },
];

const LEVEL_OPTIONS = ['ROOKIE', 'ATHLETE', 'CHAMPION'];
const CATEGORY_OPTIONS = ['PHYSICAL', 'TECHNICAL', 'MENTAL', 'NUTRITION', 'GENERAL'];
const SPORT_OPTIONS = ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'ALL'];

const SKILL_FIELDS = [
  // Physical
  { key: 'pushupScore', label: 'Push-up Score', category: 'PHYSICAL' },
  { key: 'pullupScore', label: 'Pull-up Score', category: 'PHYSICAL' },
  { key: 'sprintTime', label: 'Sprint Time', category: 'PHYSICAL' },
  { key: 'run5kTime', label: '5K Run Time', category: 'PHYSICAL' },
  
  // Mental
  { key: 'moodScore', label: 'Mood Score', category: 'MENTAL' },
  { key: 'sleepScore', label: 'Sleep Score', category: 'MENTAL' },
  
  // Nutrition
  { key: 'totalCalories', label: 'Total Calories', category: 'NUTRITION' },
  { key: 'protein', label: 'Protein', category: 'NUTRITION' },
  { key: 'carbohydrates', label: 'Carbohydrates', category: 'NUTRITION' },
  { key: 'fats', label: 'Fats', category: 'NUTRITION' },
  
  // Technical - Batting
  { key: 'battingGrip', label: 'Batting Grip', category: 'TECHNICAL' },
  { key: 'battingStance', label: 'Batting Stance', category: 'TECHNICAL' },
  { key: 'battingBalance', label: 'Batting Balance', category: 'TECHNICAL' },
  { key: 'cockingOfWrist', label: 'Cocking of Wrist', category: 'TECHNICAL' },
  { key: 'backLift', label: 'Back Lift', category: 'TECHNICAL' },
  { key: 'topHandDominance', label: 'Top Hand Dominance', category: 'TECHNICAL' },
  { key: 'highElbow', label: 'High Elbow', category: 'TECHNICAL' },
  { key: 'runningBetweenWickets', label: 'Running Between Wickets', category: 'TECHNICAL' },
  { key: 'calling', label: 'Calling', category: 'TECHNICAL' },
  
  // Technical - Bowling
  { key: 'bowlingGrip', label: 'Bowling Grip', category: 'TECHNICAL' },
  { key: 'runUp', label: 'Run Up', category: 'TECHNICAL' },
  { key: 'backFootLanding', label: 'Back Foot Landing', category: 'TECHNICAL' },
  { key: 'frontFootLanding', label: 'Front Foot Landing', category: 'TECHNICAL' },
  { key: 'hipDrive', label: 'Hip Drive', category: 'TECHNICAL' },
  { key: 'backFootDrag', label: 'Back Foot Drag', category: 'TECHNICAL' },
  { key: 'nonBowlingArm', label: 'Non-bowling Arm', category: 'TECHNICAL' },
  { key: 'release', label: 'Release', category: 'TECHNICAL' },
  { key: 'followThrough', label: 'Follow Through', category: 'TECHNICAL' },
  
  // Technical - Fielding
  { key: 'positioningOfBall', label: 'Positioning of Ball', category: 'TECHNICAL' },
  { key: 'pickUp', label: 'Pick Up', category: 'TECHNICAL' },
  { key: 'aim', label: 'Aim', category: 'TECHNICAL' },
  { key: 'throw', label: 'Throw', category: 'TECHNICAL' },
  { key: 'softHands', label: 'Soft Hands', category: 'TECHNICAL' },
  { key: 'receiving', label: 'Receiving', category: 'TECHNICAL' },
  { key: 'highCatch', label: 'High Catch', category: 'TECHNICAL' },
  { key: 'flatCatch', label: 'Flat Catch', category: 'TECHNICAL' },
];

export default function BadgeForm({ isOpen, onClose, onBadgeCreated, editingBadge }: BadgeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    motivationalText: '',
    level: 'ROOKIE',
    icon: 'trophy',
    category: 'GENERAL',
    sport: 'ALL',
    rules: [] as any[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBadge) {
      setFormData({
        name: editingBadge.name || '',
        description: editingBadge.description || '',
        motivationalText: editingBadge.motivationalText || '',
        level: editingBadge.level || 'ROOKIE',
        icon: editingBadge.icon || 'trophy',
        category: editingBadge.category || 'GENERAL',
        sport: editingBadge.sport || 'ALL',
        rules: editingBadge.rules || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        motivationalText: '',
        level: 'ROOKIE',
        icon: 'trophy',
        category: 'GENERAL',
        sport: 'ALL',
        rules: []
      });
    }
  }, [editingBadge]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, {
        skillField: '',
        operator: 'gte',
        targetValue: 0,
        ruleType: 'skill_threshold'
      }]
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingBadge ? `/api/badges/${editingBadge.id}` : '/api/badges';
      const method = editingBadge ? 'PUT' : 'POST';

      console.log('BadgeForm - Submitting badge:', { url, method, formData });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('BadgeForm - Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('BadgeForm - Success:', result);
        onBadgeCreated();
        onClose();
      } else {
        const errorText = await response.text();
        console.error('BadgeForm - Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error occurred' };
        }
        
        const errorMessage = errorData.error || errorData.message || errorText || 'Unknown error occurred';
        alert('Error saving badge: ' + errorMessage);
      }
    } catch (error) {
      console.error('BadgeForm - Network or other error:', error);
      alert('Error saving badge: Network error or invalid response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const availableSkills = SKILL_FIELDS.filter(skill => 
    formData.category === 'GENERAL' || skill.category === formData.category
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBadge ? 'Edit Badge' : 'Create New Badge'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Badge Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="Enter badge name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  {LEVEL_OPTIONS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  {CATEGORY_OPTIONS.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sport
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  {SPORT_OPTIONS.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map(({ value, label, icon: IconComponent }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange('icon', value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-6 w-6 mx-auto" />
                    <div className="text-xs mt-1 text-gray-900">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Describe what this badge represents"
              />
            </div>

            {/* Motivational Text */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Motivational Text
              </label>
              <input
                type="text"
                value={formData.motivationalText}
                onChange={(e) => handleInputChange('motivationalText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Encouraging message for earning this badge"
              />
            </div>

            {/* Badge Rules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-900">
                  Badge Rules
                </label>
                <button
                  type="button"
                  onClick={addRule}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  Add Rule
                </button>
              </div>

              {formData.rules.map((rule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Skill Field
                      </label>
                      <select
                        value={rule.skillField}
                        onChange={(e) => updateRule(index, 'skillField', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-gray-900"
                      >
                        <option value="">Select skill</option>
                        {availableSkills.map(skill => (
                          <option key={skill.key} value={skill.key}>
                            {skill.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Condition
                      </label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(index, 'operator', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-gray-900"
                      >
                        <option value="gte">Greater than or equal</option>
                        <option value="lte">Less than or equal</option>
                        <option value="eq">Equal to</option>
                        <option value="gt">Greater than</option>
                        <option value="lt">Less than</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rule.targetValue}
                        onChange={(e) => updateRule(index, 'targetValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {formData.rules.length === 0 && (
                <div className="text-sm text-gray-700 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  No rules defined. Add rules to specify when this badge should be awarded.
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingBadge ? 'Update Badge' : 'Create Badge')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 