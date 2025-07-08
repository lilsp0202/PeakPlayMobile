"use client";

import { useState } from "react";
import CoachFeedback from "./CoachFeedback";
import CoachActions from "./CoachActions";

interface FeedbackActionsProps {
  studentId?: string;
  isCoachView?: boolean;
}

export default function FeedbackActions({ studentId, isCoachView = false }: FeedbackActionsProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'actions'>('feedback');

  const tabs = [
    {
      id: 'feedback' as const,
      label: 'Coach Feedback',
      shortLabel: 'Feedback',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
        </svg>
      ),
      description: 'Performance insights from your coach',
      shortDescription: 'Performance insights'
    },
    {
      id: 'actions' as const,
      label: 'Actions',
      shortLabel: 'Actions',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
      ),
      description: 'Tasks and drills from your coach',
      shortDescription: 'Tasks and drills'
    }
  ];

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
      {/* Tab Headers - Mobile Optimized */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 text-sm font-medium border-b-2 transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </div>
              <p className={`text-xs mt-1 px-1 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'}`}>
                <span className="hidden sm:inline">{tab.description}</span>
                <span className="sm:hidden">{tab.shortDescription}</span>
              </p>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'feedback' && (
          <div className="transition-all duration-300 ease-in-out">
            <CoachFeedback studentId={studentId} isCoachView={isCoachView} />
          </div>
        )}
        
        {activeTab === 'actions' && (
          <div className="transition-all duration-300 ease-in-out">
            <CoachActions studentId={studentId} isCoachView={isCoachView} />
          </div>
        )}
      </div>
    </div>
  );
} 