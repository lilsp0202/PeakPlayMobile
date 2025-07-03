"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiCalendar } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HooperIndexData) => void;
  existingEntry?: HooperIndexData | null;
}

interface HooperIndexData {
  fatigue: number;
  stress: number;
  muscleSoreness: number;
  sleepQuality: number;
  enjoyingTraining: number;
  irritable: number;
  healthyOverall: number;
  wellRested: number;
  hooperIndex: number; // Keep the API field name for compatibility
}

// Wellness Score interpretation function
const getWellnessInterpretation = (score: number) => {
  if (score <= 16) {
    return {
      label: "Excellent",
      description: "Great recovery and wellness",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    };
  } else if (score <= 24) {
    return {
      label: "Good", 
      description: "Moderate wellness levels",
      color: "text-blue-600",
      bgColor: "bg-blue-50", 
      borderColor: "border-blue-200"
    };
  } else if (score <= 32) {
    return {
      label: "Fair",
      description: "Some fatigue or stress present",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
  } else if (score <= 40) {
    return {
      label: "Poor",
      description: "High fatigue or stress levels",
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    };
  } else {
    return {
      label: "Very Poor",
      description: "Significant fatigue and stress",
      color: "text-red-600",
      bgColor: "bg-red-50", 
      borderColor: "border-red-200"
    };
  }
};

const questions = [
  {
    id: 'fatigue',
    question: 'How fatigued do you feel?',
    icon: '😴',
    lowLabel: 'Very energetic',
    highLabel: 'Very fatigued'
  },
  {
    id: 'stress',
    question: 'How stressed do you feel?',
    icon: '😰',
    lowLabel: 'Very relaxed',
    highLabel: 'Very stressed'
  },
  {
    id: 'muscleSoreness',
    question: 'Are your muscles sore?',
    icon: '💪',
    lowLabel: 'No soreness',
    highLabel: 'Very sore'
  },
  {
    id: 'sleepQuality',
    question: 'How is your sleep quality?',
    icon: '🛏️',
    lowLabel: 'Very good',
    highLabel: 'Very poor'
  },
  {
    id: 'enjoyingTraining',
    question: 'Are you enjoying training?',
    icon: '🏃‍♂️',
    lowLabel: 'Love it',
    highLabel: 'Hate it'
  },
  {
    id: 'irritable',
    question: 'Do you feel irritable?',
    icon: '😠',
    lowLabel: 'Very calm',
    highLabel: 'Very irritable'
  },
  {
    id: 'healthyOverall',
    question: 'Do you feel healthy overall?',
    icon: '🌟',
    lowLabel: 'Very healthy',
    highLabel: 'Very unhealthy'
  },
  {
    id: 'wellRested',
    question: 'Do you feel well-rested today?',
    icon: '☀️',
    lowLabel: 'Very rested',
    highLabel: 'Very tired'
  }
];

const ScaleButton: React.FC<{
  value: number;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}> = ({ value, isSelected, onClick, color }) => (
  <motion.button
    onClick={onClick}
    className={`
      relative w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-300
      ${isSelected 
        ? `${color} text-white shadow-lg transform scale-110` 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}
    whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: value * 0.05 }}
  >
    {value}
    {isSelected && (
      <motion.div
        className="absolute -top-1 -right-1 bg-white rounded-full p-1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <FiCheck className="w-3 h-3 text-green-500" />
      </motion.div>
    )}
  </motion.button>
);

const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingEntry
}) => {
  const { data: session } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize responses with existing entry if available
  useEffect(() => {
    if (existingEntry) {
      setResponses({
        fatigue: existingEntry.fatigue,
        stress: existingEntry.stress,
        muscleSoreness: existingEntry.muscleSoreness,
        sleepQuality: existingEntry.sleepQuality,
        enjoyingTraining: existingEntry.enjoyingTraining,
        irritable: existingEntry.irritable,
        healthyOverall: existingEntry.healthyOverall,
        wellRested: existingEntry.wellRested
      });
    }
  }, [existingEntry]);

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allQuestionsAnswered = questions.every(q => responses[q.id] !== undefined);

  const getScaleColor = (value: number) => {
    if (value <= 2) return 'bg-green-500';
    if (value <= 4) return 'bg-yellow-500';
    if (value <= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleResponseSelect = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestionData.id]: value
    }));

    // Auto-advance to next question after a brief delay
    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return;

    setIsSubmitting(true);
    
    // Calculate Hooper Index (sum of all scores)
    const hooperIndex = Object.values(responses).reduce((sum, score) => sum + score, 0);
    
    const data: HooperIndexData = {
      fatigue: responses.fatigue,
      stress: responses.stress,
      muscleSoreness: responses.muscleSoreness,
      sleepQuality: responses.sleepQuality,
      enjoyingTraining: responses.enjoyingTraining,
      irritable: responses.irritable,
      healthyOverall: responses.healthyOverall,
      wellRested: responses.wellRested,
      hooperIndex
    };

    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setCurrentQuestion(0);
    setResponses({});
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset modal state when closed
      setTimeout(resetModal, 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Daily Check-in</h2>
                  <p className="text-purple-100 text-sm">
                    {existingEntry ? 'Update your' : 'How are you feeling today?'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="h-2 bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-purple-100 mt-2">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-8"
                >
                  <div className="text-4xl mb-4">{currentQuestionData.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {currentQuestionData.question}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Rate on a scale of 1-7 (1 = {currentQuestionData.lowLabel}, 7 = {currentQuestionData.highLabel})
                  </p>

                  {/* Scale Buttons */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <ScaleButton
                        key={value}
                        value={value}
                        isSelected={responses[currentQuestionData.id] === value}
                        onClick={() => handleResponseSelect(value)}
                        color={getScaleColor(value)}
                      />
                    ))}
                  </div>

                  {/* Scale Labels */}
                  <div className="flex justify-between text-xs text-gray-400 px-2">
                    <span>1 = {currentQuestionData.lowLabel}</span>
                    <span>7 = {currentQuestionData.highLabel}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-all
                    ${currentQuestion === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                  whileHover={currentQuestion > 0 ? { scale: 1.05 } : {}}
                  whileTap={currentQuestion > 0 ? { scale: 0.95 } : {}}
                >
                  Previous
                </motion.button>

                <div className="text-sm text-gray-500">
                  {Object.keys(responses).length} / {questions.length}
                </div>

                {isLastQuestion ? (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!allQuestionsAnswered || isSubmitting}
                    className={`
                      px-6 py-2 rounded-xl font-medium transition-all
                      ${allQuestionsAnswered && !isSubmitting
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                    whileHover={allQuestionsAnswered && !isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={allQuestionsAnswered && !isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      `${existingEntry ? 'Update' : 'Complete'} Check-in`
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleNext}
                    disabled={responses[currentQuestionData.id] === undefined}
                    className={`
                      px-4 py-2 rounded-xl font-medium transition-all
                      ${responses[currentQuestionData.id] !== undefined
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                    whileHover={responses[currentQuestionData.id] !== undefined ? { scale: 1.05 } : {}}
                    whileTap={responses[currentQuestionData.id] !== undefined ? { scale: 0.95 } : {}}
                  >
                    Next
                  </motion.button>
                )}
              </div>
            </div>

            {/* Wellness Score Preview (if all questions answered) */}
            {allQuestionsAnswered && (() => {
              const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
              const interpretation = getWellnessInterpretation(totalScore);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mx-6 mb-6 p-4 ${interpretation.bgColor} border ${interpretation.borderColor} rounded-xl`}
                >
                  <div className="text-center">
                    <p className={`text-sm font-medium mb-1 ${interpretation.color}`}>Your Wellness Score</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className={`text-2xl font-bold ${interpretation.color}`}>
                        {totalScore}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interpretation.bgColor} ${interpretation.color} border ${interpretation.borderColor}`}>
                        {interpretation.label}
                      </span>
                    </div>
                    <p className={`text-xs ${interpretation.color.replace('600', '500')}`}>
                      {interpretation.description}
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DailyCheckInModal; 