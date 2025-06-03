"use client";

import { useState, useRef } from "react";

interface CreateFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    studentName: string;
    username: string;
    age: number;
  };
  onFeedbackCreated: () => void;
}

export default function CreateFeedbackModal({ 
  isOpen, 
  onClose, 
  student, 
  onFeedbackCreated 
}: CreateFeedbackModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setRecordedAudio(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.play();
      setIsPlaying(true);
    } else if (audioPlayerRef.current && isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const transcribeRecording = async () => {
    if (!recordedAudio) {
      setError('No recording to transcribe');
      return;
    }

    setIsTranscribing(true);
    setError('');

    try {
      const formData = new FormData();
      // Convert webm to wav for better compatibility
      const audioFile = new File([recordedAudio], 'recording.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);

      const response = await fetch('/api/transcribe-voice', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Set the transcribed text as the content
      setFormData(prev => ({ 
        ...prev, 
        content: prev.content ? `${prev.content}\n\n${data.transcription}` : data.transcription 
      }));
      
      // Clear the recording after successful transcription
      clearRecording();
      
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to transcribe recording. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateSummary = async () => {
    if (!formData.content.trim()) {
      setError('Please enter feedback content first');
      return;
    }

    setIsGeneratingSummary(true);
    setError('');

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setGeneratedSummary(data.bulletPoints || []);
    } catch (error) {
      console.error('Summary generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const useGeneratedSummary = () => {
    if (generatedSummary.length > 0) {
      const summaryText = generatedSummary.join('\n');
      setFormData(prev => ({ ...prev, content: summaryText }));
      setGeneratedSummary([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          ...formData
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: 'GENERAL',
          priority: 'MEDIUM'
        });
        clearRecording();
        onFeedbackCreated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create feedback');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'Skills, techniques, and sport-specific abilities';
      case 'MENTAL': return 'Psychology, focus, confidence, and mental preparation';
      case 'NUTRITIONAL': return 'Diet, hydration, and nutrition planning';
      case 'TACTICAL': return 'Game strategy, positioning, and decision making';
      default: return 'General performance and overall development';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">
                For <span className="font-medium text-indigo-600">{student.studentName}</span> (@{student.username})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Great improvement in batting technique"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                required
              />
            </div>

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="MENTAL">Mental</option>
                  <option value="NUTRITIONAL">Nutritional</option>
                  <option value="TACTICAL">Tactical</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getCategoryDescription(formData.category)}
                </p>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.priority === 'HIGH' && 'Important - requires immediate attention'}
                  {formData.priority === 'MEDIUM' && 'Standard feedback for regular improvement'}
                  {formData.priority === 'LOW' && 'General guidance and encouragement'}
                </p>
              </div>
            </div>

            {/* Content Field with Voice Recording */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Feedback Content *
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">or</span>
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      isRecording 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                        Stop Recording ({formatTime(recordingTime)})
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                        </svg>
                        Record Voice
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Voice Recording Controls */}
              {recordedAudio && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={playRecording}
                        className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        {isPlaying ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V17M9 10v4a4 4 0 004 4h0a4 4 0 004-4v-1"/>
                          </svg>
                        )}
                      </button>
                      <span className="text-sm text-green-700">
                        Recording ready ({formatTime(recordingTime)})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={transcribeRecording}
                        disabled={isTranscribing}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        {isTranscribing ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-green-700 border-t-transparent rounded-full animate-spin"></div>
                            <span>Transcribing...</span>
                          </div>
                        ) : (
                          'Add to Feedback'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={clearRecording}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                placeholder="Provide detailed feedback about the student's performance, areas of improvement, strengths, and specific recommendations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-900"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Be specific and constructive. Include both positive reinforcement and areas for improvement.
              </p>
            </div>

            {/* AI Summary Generator */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">AI Summary Generator</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Generate student-friendly bullet points from your feedback
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || !formData.content.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingSummary ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Generate Summary
                    </>
                  )}
                </button>
              </div>

              {/* Generated Summary Display */}
              {generatedSummary.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-blue-900">Generated Student Summary</h5>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={useGeneratedSummary}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                      >
                        Use This Summary
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeneratedSummary([])}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {generatedSummary.map((point, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="text-sm text-blue-800 leading-relaxed">{point}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-3 italic">
                    This summary is automatically generated. You can edit it further or use it as-is.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Preview Card */}
            {formData.title && formData.content && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      formData.category === 'TECHNICAL' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      formData.category === 'MENTAL' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      formData.category === 'NUTRITIONAL' ? 'bg-green-100 text-green-800 border-green-200' :
                      formData.category === 'TACTICAL' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {formData.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      formData.priority === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' :
                      formData.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      {formData.priority}
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-900 text-sm">{formData.title}</h5>
                  <p className="text-sm text-gray-600 line-clamp-3">{formData.content}</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 