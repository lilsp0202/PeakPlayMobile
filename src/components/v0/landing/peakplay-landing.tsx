"use client"

import { useState, useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Users, Target, BarChart3, Video, MapPin, Monitor, Menu, X } from "lucide-react"

const roles = [
  {
    id: "athlete",
    title: "Athlete",
    description:
      "Get your personalized training roadmap with AI-powered insights that track your progress across strength, speed, technique, and mental performance.",
    color: "bg-gradient-to-br from-purple-100 to-purple-200",
    textColor: "text-purple-800",
    borderColor: "border-purple-200",
    icon: Target,
    stats: "94% improvement rate",
  },
  {
    id: "parent",
    title: "Parent",
    description:
      "Stay connected with transparent updates on your child's development, nutrition plans, and achievements through our secure family portal.",
    color: "bg-gradient-to-br from-orange-100 to-orange-200",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
    icon: TrendingUp,
    stats: "100% transparency guaranteed",
  },
  {
    id: "coach",
    title: "Coach",
    description:
      "Manage your entire roster from one intelligent dashboard—assign workouts, monitor real-time progress, and celebrate every breakthrough with data-backed insights.",
    color: "bg-gradient-to-br from-green-100 to-green-200",
    textColor: "text-green-800",
    borderColor: "border-green-200",
    icon: Users,
    stats: "3x faster progress tracking",
  },
]

const features = [
  { icon: BarChart3, text: "Real-time Analytics" },
  { icon: Target, text: "Personalized Training" },
  { icon: Users, text: "Team Collaboration" },
  { icon: TrendingUp, text: "Progress Tracking" },
]

const skillPillars = [
  {
    title: "Physical",
    icon: "⚡",
    description: "Assess strength, speed, and agility to build a robust foundation and reduce injury risk.",
    bgColor: "bg-indigo-100/80",
    textColor: "text-indigo-600",
    particleColor: "bg-indigo-200",
  },
  {
    title: "Technique",
    icon: "🎯",
    description: "Analyze movement patterns to refine skills for better precision and execution.",
    bgColor: "bg-purple-100/80",
    textColor: "text-purple-600",
    particleColor: "bg-purple-200",
  },
  {
    title: "Tactical",
    icon: "👁️",
    description: "Evaluate game awareness and decision-making for strategic advantage.",
    bgColor: "bg-indigo-100/80",
    textColor: "text-indigo-600",
    particleColor: "bg-indigo-200",
  },
  {
    title: "Mental",
    icon: "🧠",
    description: "Measure focus, resilience, and confidence to excel under pressure.",
    bgColor: "bg-purple-100/80",
    textColor: "text-purple-600",
    particleColor: "bg-purple-200",
  },
  {
    title: "Nutrition",
    icon: "🍎",
    description: "Guide healthy eating habits that fuel performance and recovery.",
    bgColor: "bg-indigo-100/80",
    textColor: "text-indigo-600",
    particleColor: "bg-indigo-200",
  },
]

const coachingOptions = [
  {
    title: "Video Call Sessions",
    icon: Video,
    description: "Get real-time feedback from anywhere.",
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "In-Person Training",
    icon: MapPin,
    description: "Enjoy hands-on guidance tailored to you.",
    color: "from-green-500 to-teal-600",
  },
  {
    title: "Video Analysis",
    icon: Monitor,
    description: "Review and improve your performance effectively.",
    color: "from-orange-500 to-red-600",
  },
]

const venueFeatures = [
  {
    title: "Interactive Map",
    icon: MapPin,
    description: "Pinpoint turf wickets, floodlit fields or all-weather nets nearby.",
    color: "text-indigo-600",
  },
  {
    title: "Instant Booking",
    icon: Monitor,
    description: "Real-time availability, transparent rates and secure checkout.",
    color: "text-purple-600",
  },
  {
    title: "Venue Details",
    icon: Users,
    description: "High-res photos, pitch specs and peer ratings at a glance.",
    color: "text-indigo-600",
  },
]

const values = [
  {
    title: "Athlete-Centric Growth",
    description: "We nurture the whole athlete—physical, mental and emotional.",
  },
  {
    title: "Empowered Coaching",
    description: "Tools and insights that amplify mentorship and trust.",
  },
  {
    title: "Equity in Access",
    description: "High-quality training for every community.",
  },
  {
    title: "Joy in the Journey",
    description: "Balance discipline with curiosity and fun.",
  },
  {
    title: "Integrity Through Data",
    description: "Transparent metrics you can rely on.",
  },
]

export default function PeakPlayLanding() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % roles.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Track user interactions
  const handleWatchDemo = () => {
    console.log("Watch Demo Clicked")
  }

  const handleRoleCardClick = (roleTitle: string) => {
    console.log("Role Card Clicked", { role: roleTitle })
  }

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact Form Submitted")
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="relative overflow-hidden">
        {/* Professional Animated Background System */}
        <div className="absolute inset-0 overflow-hidden bg-white">
          <div className="absolute inset-0 animate-professional-gradient"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(99, 102, 241, 0.03) 0%, 
                  rgba(168, 85, 247, 0.02) 25%, 
                  rgba(139, 92, 246, 0.03) 50%, 
                  rgba(99, 102, 241, 0.02) 75%, 
                  rgba(168, 85, 247, 0.03) 100%
                )
              `,
              backgroundSize: "400% 400%",
            }}
          />

          {/* Mesh Gradient Overlay */}
          <div
            className="absolute inset-0 animate-mesh-gradient"
            style={{
              background: `
                radial-gradient(
                  circle at 50% 50%,
                  rgba(99, 102, 241, 0.02) 0%,
                  rgba(168, 85, 247, 0.015) 25%,
                  rgba(139, 92, 246, 0.02) 50%,
                  rgba(99, 102, 241, 0.015) 75%,
                  rgba(168, 85, 247, 0.02) 100%
                )
              `,
              backgroundSize: "120% 120%",
            }}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 md:hidden bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-lg border border-gray-200 hover:scale-110 transition-transform duration-300"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white backdrop-blur-xl md:hidden">
            <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
              <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  Get Started
                </Button>
              </Link>
              <Button
                onClick={() => {
                  handleWatchDemo()
                  setIsMenuOpen(false)
                }}
                className="w-full max-w-xs bg-white text-gray-800 border-2 border-gray-200 rounded-full py-6 text-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Features */}
            <div className="flex justify-center gap-2 sm:gap-6 mb-6 sm:mb-8 flex-wrap">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 sm:gap-2 bg-white/75 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-gray-200 shadow-md hover:shadow-lg hover:bg-white/85 hover:scale-105 transition-all duration-300 cursor-pointer group text-xs sm:text-sm"
                >
                  <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300" />
                  <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Hero */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-8 leading-tight text-slate-800">
                Unlock Your
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  Peak Performance.
                </span>
              </h1>
              <p className="text-sm sm:text-xl text-slate-600 mb-6 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Redefining youth sports development with a future-forward platform that's purposeful,
                performance-measurable, and makes the journey unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg"
                  onClick={handleWatchDemo}
                >
                  <Play className="w-3 h-3 sm:w-5 sm:h-5 mr-2" />
                  Watch Demo
                </Button>
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                  <Link href="/auth/signup" className="flex-1 sm:flex-initial">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth/signin" className="flex-1 sm:flex-initial">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
