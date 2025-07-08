"use client";

import { useState, useRef } from "react";

interface CreateFeedbackActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    studentName: string;
    username: string;
    age: number;
  };
  onCreated: () => void;
  defaultMode?: 'feedback' | 'action';
}

export default function CreateFeedbackActionModal({ 
  isOpen, 
  onClose, 
  student, 
  onCreated,
  defaultMode = 'feedback'
}: CreateFeedbackActionModalProps) {
  const [mode, setMode] = useState<'feedback' | 'action'>(defaultMode);
  const [formData, setFormData] = useState({
    title: '',
    content: '', // For feedback
    description: '', // For actions
    category: 'GENERAL' as 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: '' // For actions only
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
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
      const audioFormData = new FormData();
      const audioFile = new File([recordedAudio], 'recording.webm', { type: 'audio/webm' });
      audioFormData.append('audio', audioFile);

      const response = await fetch('/api/transcribe-voice', {
        method: 'POST',
        body: audioFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      const currentContent = mode === 'feedback' ? formData.content : formData.description;
      const newContent = currentContent ? `${currentContent}\n\n${data.transcription}` : data.transcription;
      
      setFormData(prev => ({ 
        ...prev, 
        [mode === 'feedback' ? 'content' : 'description']: newContent
      }));
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contentField = mode === 'feedback' ? formData.content : formData.description;
    if (!formData.title.trim() || !contentField.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = mode === 'feedback' ? '/api/feedback' : '/api/actions';
      const payload = mode === 'feedback' 
        ? {
            studentId: student.id,
            title: formData.title,
            content: formData.content,
            category: formData.category,
            priority: formData.priority
          }
        : {
            studentId: student.id,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            dueDate: formData.dueDate || null
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          description: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
          dueDate: ''
        });
        clearRecording();
        onCreated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || `Failed to create ${mode}`);
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
    if (error) setError('');
  };

  const getCategoryDescription = (category: string) => {
    if (mode === 'feedback') {
      switch (category) {
        case 'TECHNICAL': return 'Skills, techniques, and sport-specific abilities';
        case 'MENTAL': return 'Psychology, focus, confidence, and mental preparation';
        case 'NUTRITIONAL': return 'Diet, hydration, and nutrition planning';
        case 'TACTICAL': return 'Game strategy, positioning, and decision making';
        default: return 'General performance and overall development';
      }
    } else {
      switch (category) {
        case 'TECHNICAL': return 'Drills, techniques, and skill-building exercises';
        case 'MENTAL': return 'Mental training, focus exercises, and mindset tasks';
        case 'NUTRITIONAL': return 'Diet plans, hydration goals, and nutrition tracking';
        case 'TACTICAL': return 'Strategy practice, game analysis, and tactical drills';
        default: return 'General training and development tasks';
      }
    }
  };

  const getActionSuggestions = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return [
          'Practice 50 batting shots against spin bowling',
          'Complete 30 catches practice session',
          'Work on bowling action for 45 minutes',
          'Practice footwork drills for 20 minutes'
        ];
      case 'MENTAL':
        return [
          'Complete 10-minute meditation session daily',
          'Visualize match scenarios for 15 minutes',
          'Practice positive self-talk during training',
          'Write match goals and strategies in journal'
        ];
      case 'NUTRITIONAL':
        return [
          'Drink 3 liters of water daily',
          'Eat protein within 30 minutes after training',
          'Track meal timing and portions for one week',
          'Avoid processed foods for next 7 days'
        ];
      case 'TACTICAL':
        return [
          'Analyze opposition batting patterns from last match',
          'Practice field positioning for different bowlers',
          'Study game footage for 30 minutes',
          'Discuss game strategy with captain'
        ];
      default:
        return [
          'Complete fitness assessment',
          'Attend team meeting on time',
          'Update skill tracking in PeakPlay',
          'Review and set weekly goals'
        ];
    }
  };

  const fillSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, title: suggestion }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create {mode === 'feedback' ? 'Feedback' : 'Action'}
              </h2>
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

          {/* Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('feedback')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'feedback'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
              </svg>
              <span>Feedback</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('action')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'action'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
              <span>Action</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="ml-3 text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'feedback' ? 'Feedback' : 'Action'} Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={mode === 'feedback' 
                  ? "e.g., Great improvement in batting technique"
                  : "e.g., Practice batting stance for 30 minutes"
                }
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
                  {formData.priority === 'HIGH' && (mode === 'feedback' ? 'Important - requires immediate attention' : 'Must be completed soon')}
                  {formData.priority === 'MEDIUM' && (mode === 'feedback' ? 'Standard feedback for regular improvement' : 'Standard priority task')}
                  {formData.priority === 'LOW' && (mode === 'feedback' ? 'General guidance and encouragement' : 'Complete when possible')}
                </p>
              </div>
            </div>

            {/* Due Date for Actions */}
            {mode === 'action' && (
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a deadline for this action (optional)
                </p>
              </div>
            )}

            {/* Quick Suggestions for Actions */}
            {mode === 'action' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Quick Suggestions for {formData.category}:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {getActionSuggestions(formData.category).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => fillSuggestion(suggestion)}
                      className="text-left p-2 text-sm text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content/Description Field with Voice Recording */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={mode === 'feedback' ? 'content' : 'description'} className="block text-sm font-medium text-gray-700">
                  {mode === 'feedback' ? 'Feedback Content' : 'Action Description'} *
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
                          `Add to ${mode === 'feedback' ? 'Feedback' : 'Action'}`
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
                id={mode === 'feedback' ? 'content' : 'description'}
                name={mode === 'feedback' ? 'content' : 'description'}
                value={mode === 'feedback' ? formData.content : formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder={mode === 'feedback' 
                  ? "Provide detailed feedback about the student's performance, areas of improvement, strengths, and specific recommendations..."
                  : "Provide detailed instructions for this task. Include specific goals, duration, techniques to focus on, and success criteria..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-900"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                {mode === 'feedback' 
                  ? 'Be specific and constructive. Include both positive reinforcement and areas for improvement.'
                  : 'Be clear and specific. Include what success looks like and any important notes.'
                }
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  `Create ${mode === 'feedback' ? 'Feedback' : 'Action'}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 