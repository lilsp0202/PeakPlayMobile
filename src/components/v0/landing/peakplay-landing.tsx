"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Users, Target, BarChart3, Video, MapPin, Monitor, ChevronRight, Sparkles, Activity, Brain, Apple, Zap, Menu, X } from "lucide-react"
import { track } from "@vercel/analytics"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

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
    description: "Build strength, speed, and agility",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
  },
  {
    title: "Technical",
    icon: Target,
    emoji: "🎯",
    description: "Perfect your batting & bowling",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
  },
  {
    title: "Tactical",
    icon: Brain,
    emoji: "🧠",
    description: "Master game strategy",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
  },
  {
    title: "Mental",
    icon: Activity,
    emoji: "💪",
    description: "Build confidence & focus",
    color: "from-green-500 to-teal-600",
    bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
  },
  {
    title: "Nutrition",
    icon: Apple,
    emoji: "🍎",
    description: "Fuel peak performance",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
  },
]

const coachingOptions = [
  {
    title: "Video Sessions",
    icon: Video,
    description: "Live expert feedback",
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "In-Person",
    icon: MapPin,
    description: "Local certified coaches",
    color: "from-green-500 to-teal-600",
  },
  {
    title: "Analysis",
    icon: Monitor,
    description: "Performance review",
    color: "from-orange-500 to-red-600",
  },
]

export default function PeakPlayLanding() {
  const [activeRole, setActiveRole] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % roles.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleWatchDemo = () => {
    track("Watch Demo Clicked")
  }

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    track("Contact Form Submitted")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [-50, 50, -50],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
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
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative px-6 pt-20 pb-16 md:pt-32 md:pb-24"
      >
        <div className="max-w-6xl mx-auto">
          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-gray-900">Unlock Your</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Peak Performance
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your cricket journey with AI-powered training, real-time analytics, and expert coaching
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatchDemo}
              className="mt-6 text-indigo-600 font-medium hover:text-purple-600 transition-colors inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Roles Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tailored Solutions
              </span>
              <br />
              <span className="text-gray-900">for Every Role</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative bg-gradient-to-br ${role.bgGradient} rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} opacity-10 rounded-full blur-3xl`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{role.emoji}</div>
                  <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                    {role.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{role.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Framework */}
      <section className="px-6 py-16 md:py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">SkillSnap Framework</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Five Pillars of</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Athletic Excellence
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {skillPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`${pillar.bgColor} rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${pillar.color} mb-3`}>
                  <pillar.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{pillar.title}</h3>
                <p className="text-xs text-gray-600">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Marketplace */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Expert Coaching
              </span>
              <br />
              <span className="text-gray-900">Marketplace</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with certified coaches for batting, bowling, and mental preparation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {coachingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${option.color} mb-4`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{option.title}</h3>
                <p className="text-gray-600">{option.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Ready to</span>{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Get Started?
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of athletes transforming their game
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleContactFormSubmit}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                placeholder="First Name"
                className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-6"
            />
            <textarea
              placeholder="Tell us about your cricket goals..."
              rows={4}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-8 resize-none"
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
            >
              Send Message
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.form>
        </div>
      </section>
    </div>
  )
} 