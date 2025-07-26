'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AthleteDashboard() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, matchesRes, badgesRes] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/matches'),
          fetch('/api/badges?type=progress')
        ])

        const [skillsData, matchesData, badgesData] = await Promise.all([
          skillsRes.json(),
          matchesRes.json(),
          badgesRes.json()
        ])

        setSkills(skillsData)
        setMatches(matchesData.slice(0, 5)) // Latest 5 matches
        setBadges(badgesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-indigo-400 opacity-20"></div>
          </div>
        </div>
      </div>
    )
  }

  const skillCategories = [
    { name: 'Physical', icon: '💪', color: 'from-red-500 to-orange-500', score: skills?.pushupScore || 0, max: 50 },
    { name: 'Technical', icon: '⚡', color: 'from-blue-500 to-indigo-500', score: skills?.battingBalance || 0, max: 10 },
    { name: 'Tactical', icon: '🧠', color: 'from-green-500 to-teal-500', score: 7, max: 10 },
    { name: 'Mental', icon: '🎯', color: 'from-purple-500 to-pink-500', score: skills?.moodScore || 0, max: 10 },
    { name: 'Nutrition', icon: '🥗', color: 'from-yellow-500 to-orange-500', score: skills?.totalCalories ? 8 : 0, max: 10 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-6 md:mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border border-white/20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 md:-top-8 -right-4 md:-right-8 w-16 md:w-32 h-16 md:h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-4 md:-bottom-8 -left-4 md:-left-8 w-12 md:w-24 h-12 md:h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-300"></div>
              <div className="absolute top-2 md:top-4 left-1/2 w-8 md:w-16 h-8 md:h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 md:ring-4 ring-white/30">
                  <span className="text-lg md:text-2xl">🏏</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
                    Welcome back, {session?.user?.name || 'Athlete'}!
                  </h1>
                  <p className="text-white/80 text-sm md:text-lg">Track your progress and elevate your game to new heights</p>
                  <div className="flex items-center space-x-3 md:space-x-4 mt-2 md:mt-3">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs md:text-sm text-white/90 font-medium">Online</span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs md:text-sm text-white/90 font-medium">Level 5 Athlete</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none px-3 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">5</span>
                    </div>
                    <div>
                      <span className="text-xs md:text-sm font-semibold text-white">Level 5</span>
                      <p className="text-xs text-white/80 hidden md:block">Elite Athlete</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 sm:flex-none px-3 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm md:text-lg">🏆</span>
                    </div>
                    <div>
                      <span className="text-xs md:text-sm font-semibold text-white">Rank #12</span>
                      <p className="text-xs text-white/80 hidden md:block">This Month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Skill Development
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {skillCategories.map((skill, index) => (
              <div
                key={skill.name}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="text-sm font-semibold text-gray-500">{skill.score}/{skill.max}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">{skill.name}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${skill.color} transition-all duration-1000 ease-out`}
                      style={{
                        width: `${(skill.score / skill.max) * 100}%`,
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {skill.score === 0 ? 'Not assessed' : `${Math.round((skill.score / skill.max) * 100)}% progress`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Matches */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900">{matches.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <span className="text-white text-xl">🏏</span>
              </div>
            </div>
          </div>

          {/* Avg Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-3xl font-bold text-gray-900">8.2</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-3xl font-bold text-gray-900">{badges.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <span className="text-white text-xl">🏆</span>
              </div>
            </div>
          </div>

          {/* Training Hours */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Hours</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <span className="text-white text-xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">🏆</span>
              Recent Matches
            </h2>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105">
              View All
            </Button>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {matches.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🏏</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600">Start tracking your matches to see your progress here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {matches.map((match, index) => (
                  <div key={match.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{match.opponent || 'Practice Match'}</h3>
                          <p className="text-sm text-gray-600">{new Date(match.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {match.playerScore || 'N/A'} / {match.opponentScore || 'N/A'}
                        </div>
                        <div className={`text-sm font-medium ${
                          (match.playerScore || 0) > (match.opponentScore || 0) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {(match.playerScore || 0) > (match.opponentScore || 0) ? 'Won' : 'Lost'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Button className="h-24 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Update Skills</div>
            </div>
          </Button>
          
          <Button className="h-24 bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">🏏</div>
              <div className="font-semibold">Add Match</div>
            </div>
          </Button>
          
          <Button className="h-24 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">View Goals</div>
            </div>
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
} 