"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Users, Target, BarChart3, Video, MapPin, Monitor, ChevronRight, Sparkles, Activity, Brain, Apple, Zap, Menu, X, Eye } from "lucide-react"
import { track } from "@vercel/analytics"
import { motion, AnimatePresence } from "framer-motion"

const roles = [
  {
    id: "athlete",
    title: "Athlete",
    description:
      "Get your personalized training roadmap with AI-powered insights that track your progress across strength, speed, technique, and mental performance.",
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    icon: Target,
    emoji: "🎯",
  },
  {
    id: "parent",
    title: "Parent",
    description:
      "Stay connected with transparent updates on your child's development, nutrition plans, and achievements through our secure family portal.",
    color: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    icon: TrendingUp,
    emoji: "📈",
  },
  {
    id: "coach",
    title: "Coach",
    description:
      "Manage your entire roster from one intelligent dashboard—assign workouts, monitor real-time progress, and celebrate every breakthrough with data-backed insights.",
    color: "from-green-500 to-teal-500",
    bgGradient: "from-green-50 to-teal-50",
    icon: Users,
    emoji: "👥",
  },
]

const features = [
  { icon: BarChart3, text: "Real-time Analytics", color: "text-blue-600" },
  { icon: Target, text: "Personalized Training", color: "text-purple-600" },
  { icon: Users, text: "Team Collaboration", color: "text-green-600" },
  { icon: TrendingUp, text: "Progress Tracking", color: "text-orange-600" },
]

const skillPillars = [
  {
    title: "Physical",
    icon: Zap,
    emoji: "⚡",
    description: "Assess strength, speed, and agility to build a robust foundation and reduce injury risk.",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    textColor: "text-blue-800",
  },
  {
    title: "Technique",
    icon: Target,
    emoji: "🎯",
    description: "Analyze movement patterns to refine skills for better precision and execution.",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    textColor: "text-purple-800",
  },
  {
    title: "Tactical",
    icon: Eye,
    emoji: "👁️",
    description: "Evaluate game awareness and decision-making for strategic advantage.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    textColor: "text-amber-800",
  },
  {
    title: "Mental",
    icon: Brain,
    emoji: "🧠",
    description: "Measure focus, resilience, and confidence to excel under pressure.",
    color: "from-green-500 to-teal-600",
    bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
    textColor: "text-green-800",
  },
  {
    title: "Nutrition",
    icon: Apple,
    emoji: "🍎",
    description: "Guide healthy eating habits that fuel performance and recovery.",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
    textColor: "text-red-800",
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleWatchDemo = () => {
    track("Watch Demo Clicked")
  }

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    track("Contact Form Submitted")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative">
      {/* Simplified Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-lg"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
              <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full py-6 text-lg font-semibold shadow-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full py-6 text-lg font-semibold shadow-xl">
                  Get Started
                </Button>
              </Link>
              <Button
                onClick={() => {
                  handleWatchDemo()
                  setIsMenuOpen(false)
                }}
                className="w-full max-w-xs bg-white text-gray-800 border-2 border-gray-200 rounded-full py-6 text-lg font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 hover:scale-105 transition-transform duration-200"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Main Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-gray-900">Unlock Your</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Peak Performance.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Redefining youth sports development with a future-forward platform that's purposeful, performance-measurable, and makes the journey unforgettable.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                  Get Started
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <button
              onClick={handleWatchDemo}
              className="text-indigo-600 font-medium hover:text-purple-600 transition-colors inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Tailored Solutions for Every Role
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're an athlete, coach, or parent, PeakPlay adapts to your unique needs with personalized dashboards and insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div
                key={role.id}
                className={`relative bg-gradient-to-br ${role.bgGradient} rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} opacity-10 rounded-full blur-3xl`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{role.emoji}</div>
                  <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                    {role.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Framework */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">SkillSnap Framework</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              SkillSnap - Our Five-Pillar Skills Framework
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive approach to athletic development, with every skill supporting your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {skillPillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`${pillar.bgColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="text-4xl mb-4">{pillar.emoji}</div>
                <h3 className={`text-xl font-bold mb-2 ${pillar.textColor}`}>{pillar.title}</h3>
                <p className={`${pillar.textColor} opacity-90 text-sm`}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Marketplace */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Specialized Coach Marketplace
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Preparing for specific conditions?
            </p>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
              Unlock your cricket potential with certified coaches specializing in batting, bowling, strategy, and mental preparation. Whether you prefer remote sessions, in-person training, or video analysis, our platform connects you with the right expert at a convenient time and budget.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Diverse Coaching Options</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coachingOptions.map((option, index) => (
              <div
                key={option.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${option.color} mb-4`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{option.title}:</h3>
                <p className="text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Find Your Perfect Venue
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Never hunt for grounds, fields, or nets again—discover, compare and book the perfect venue in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {venueFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-indigo-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}:</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              Ready to play? <span className="font-bold">Search. Book. Dominate.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-indigo-100">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600">
              Interested in working together? Fill out some info and we will be in touch shortly. We can't wait to hear from you!
            </p>
          </div>

          <form
            onSubmit={handleContactFormSubmit}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                required
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
            >
              SEND
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold">PeakPlay</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 PeakPlay. All rights reserved.<br />
            Made with ❤️ for athletes worldwide
          </div>
        </div>
      </footer>
    </div>
  )
} 