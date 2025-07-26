"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Eye, Edit3, Users, RotateCcw } from "lucide-react";

interface ScorecardUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  role?: string;
}

interface AnalysisResult {
  availablePlayers: string[];
  selectedPlayer: string;
  matchDetails: {
    matchName: string;
    opponent: string;
    venue: string;
    matchDate: string;
    matchType: string;
    result: string;
  };
  playerStats: {
    batting: {
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      dots: number;
      notOut: boolean;
      strikeRate: number;
    };
    bowling: {
      wickets: number;
      overs: number;
      maidens: number;
      runs: number;
      wides: number;
      noBalls: number;
      economyRate: number;
    };
    fielding: {
      catches: number;
      runOuts: number;
      stumpings: number;
    };
  };
  confidence: number;
  notes: string;
  error?: string;
}

const ScorecardUploadModal: React.FC<ScorecardUploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  role = "BATSMAN"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPlayerVerification, setShowPlayerVerification] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload an image under 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const analyzeScorecard = async (playerName?: string) => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('scorecard', selectedFile);
      if (playerName) {
        formData.append('targetPlayerName', playerName);
      }

      const response = await fetch('/api/analyze-scorecard', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze scorecard');
      }

      setUploadProgress(100);
      setAnalysisResult(result);
      
      // If multiple players were found and no specific player was requested, show player selection
      if (result.availablePlayers && result.availablePlayers.length > 1 && !playerName) {
        setShowPlayerSelection(true);
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      let errorMessage = 'Failed to analyze scorecard';
      
      if (err instanceof Error) {
        if (err.message.includes('API key') || err.message.includes('not configured')) {
          errorMessage = 'AI analysis is not configured. The scorecard analysis feature requires an OpenAI API key to be set up. Please contact your administrator or enter the match statistics manually.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (err.message.includes('File size')) {
          errorMessage = 'File size too large. Please upload an image under 10MB.';
        } else if (err.message.includes('image')) {
          errorMessage = 'Please upload a valid image file (JPG, PNG, etc.)';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handlePlayerSelection = (playerName: string) => {
    setShowPlayerSelection(false);
    analyzeScorecard(playerName);
  };

  const handlePlayerVerification = () => {
    if (analysisResult && analysisResult.selectedPlayer && analysisResult.selectedPlayer !== "Unknown Player") {
      setShowPlayerVerification(true);
    } else {
      handleUseResults();
    }
  };

  const confirmPlayerIdentity = (isCorrect: boolean) => {
    setShowPlayerVerification(false);
    
    if (isCorrect) {
      handleUseResults();
    } else {
      // Show player selection if there are multiple players, or allow manual entry
      if (analysisResult?.availablePlayers && analysisResult.availablePlayers.length > 1) {
        setShowPlayerSelection(true);
      } else {
        setError('Player name verification failed. Please enter your match statistics manually or upload a clearer scorecard image.');
      }
    }
  };

  const handleUseResults = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setShowPreview(false);
    setShowPlayerSelection(false);
    setShowPlayerVerification(false);
    setIsAnalyzing(false);
    setUploadProgress(0);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    if (confidence > 0) return 'Low Confidence';
    return 'Analysis Failed';
  };

  if (!isOpen) return null;

  const isBatsman = role === "BATSMAN" || role === "ALL_ROUNDER";
  const isBowler = role === "BOWLER" || role === "ALL_ROUNDER";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Scorecard</h2>
              <p className="text-sm text-gray-600">AI-powered cricket scorecard analysis</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* File Upload Area */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload your cricket scorecard
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an image or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Choose File
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* File Preview */}
          {selectedFile && previewUrl && (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Scorecard preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title="Full screen preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysisResult(null);
                      setError(null);
                    }}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Analysis Button */}
              {!analysisResult && !isAnalyzing && (
                <button
                  onClick={() => analyzeScorecard()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Analyze Scorecard with AI
                </button>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3 py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Analyzing scorecard...</p>
                      <p className="text-sm text-gray-600">AI is reading the cricket statistics</p>
                    </div>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                  <button
                    onClick={() => analyzeScorecard()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-1" />
                    Try Again
                  </button>
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && !showPlayerSelection && (
                <div className="space-y-6">
                  {/* Confidence Score */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Analysis Complete</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                      {getConfidenceText(analysisResult.confidence)} ({analysisResult.confidence}%)
                    </div>
                  </div>

                  {/* Player Stats Extracted For */}
                  {analysisResult.selectedPlayer && analysisResult.selectedPlayer !== "Unknown Player" && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Player Stats Extracted For
                      </h4>
                      <p className="text-blue-800 font-medium text-lg">{analysisResult.selectedPlayer}</p>
                      {analysisResult.availablePlayers.length > 1 && (
                        <p className="text-blue-600 text-sm mt-1">
                          Other players found: {analysisResult.availablePlayers.filter(p => p !== analysisResult.selectedPlayer).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Match Details */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Match Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Match:</span> {analysisResult.matchDetails.matchName}</p>
                      <p><span className="font-medium">Opponent:</span> {analysisResult.matchDetails.opponent}</p>
                      <p><span className="font-medium">Venue:</span> {analysisResult.matchDetails.venue}</p>
                      <p><span className="font-medium">Date:</span> {new Date(analysisResult.matchDetails.matchDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Type:</span> {analysisResult.matchDetails.matchType}</p>
                      <p><span className="font-medium">Result:</span> {analysisResult.matchDetails.result}</p>
                    </div>
                  </div>

                  {/* Batting Performance */}
                  {isBatsman && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Batting Performance</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Runs</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.batting.runs}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Balls</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.batting.balls}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">4s / 6s</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.batting.fours} / {analysisResult.playerStats.batting.sixes}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Strike Rate</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.batting.strikeRate.toFixed(1)}</p>
                        </div>
                      </div>
                      {analysisResult.playerStats.batting.notOut && (
                        <p className="text-green-600 font-medium mt-2">Not Out</p>
                      )}
                    </div>
                  )}

                  {/* Bowling Performance */}
                  {isBowler && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Bowling Performance</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Wickets</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.bowling.wickets}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Overs</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.bowling.overs}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Runs</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.bowling.runs}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Economy</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.bowling.economyRate.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fielding Performance */}
                  {(analysisResult.playerStats.fielding.catches > 0 || analysisResult.playerStats.fielding.runOuts > 0 || analysisResult.playerStats.fielding.stumpings > 0) && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Fielding Performance</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Catches</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.fielding.catches}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Run Outs</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.fielding.runOuts}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Stumpings</p>
                          <p className="font-bold text-lg">{analysisResult.playerStats.fielding.stumpings}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Notes */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Analysis Notes</h4>
                    <p className="text-gray-700 text-sm">{analysisResult.notes}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePlayerVerification}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Use These Results
                    </button>
                    <button
                      onClick={() => analyzeScorecard()}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 inline mr-2" />
                      Re-analyze
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewUrl}
              alt="Scorecard full preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Player Selection Modal */}
      {showPlayerSelection && analysisResult?.availablePlayers && analysisResult.availablePlayers.length > 1 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Players Found</h3>
              <p className="text-gray-600">Which player's statistics would you like to extract?</p>
            </div>
            
            <div className="space-y-3">
              {analysisResult.availablePlayers.map((player, index) => (
                <button
                  key={index}
                  onClick={() => handlePlayerSelection(player)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200"
                >
                  <p className="font-semibold text-gray-900">{player}</p>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowPlayerSelection(false)}
              className="w-full mt-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Player Verification Modal */}
      {showPlayerVerification && analysisResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Player Identity</h3>
              <p className="text-gray-600 mb-4">The AI identified this player from the scorecard:</p>
              <div className="p-3 bg-blue-50 rounded-lg mb-4">
                <p className="text-blue-900 font-bold text-lg">{analysisResult.selectedPlayer}</p>
              </div>
              <p className="text-gray-600">Is this your name?</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => confirmPlayerIdentity(true)}
                className="w-full p-4 text-center bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-lg transition-all duration-200"
              >
                <p className="font-semibold text-green-900">✓ Yes, this is me</p>
              </button>
              <button
                onClick={() => confirmPlayerIdentity(false)}
                className="w-full p-4 text-center bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
              >
                <p className="font-semibold text-red-900">✗ No, this is not me</p>
              </button>
            </div>
            
            <button
              onClick={() => setShowPlayerVerification(false)}
              className="w-full mt-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ScorecardUploadModal; 