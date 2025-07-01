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
    <>
      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes professionalGradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes meshGradientShift {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.4; 
          }
          25% { 
            transform: scale(1.05) rotate(90deg); 
            opacity: 0.5; 
          }
          50% { 
            transform: scale(0.95) rotate(180deg); 
            opacity: 0.3; 
          }
          75% { 
            transform: scale(1.02) rotate(270deg); 
            opacity: 0.45; 
          }
        }

        @keyframes floatingOrb {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) scale(1.05); 
          }
          50% { 
            transform: translateY(-10px) translateX(-15px) scale(0.95); 
          }
          75% { 
            transform: translateY(-30px) translateX(5px) scale(1.02); 
          }
        }

        @keyframes morphingShape {
          0%, 100% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
            transform: scale(1);
          }
          25% { 
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
            transform: scale(1.1);
          }
          50% { 
            border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; 
            transform: scale(0.9);
          }
          75% { 
            border-radius: 70% 30% 50% 50% / 40% 60% 30% 70%; 
            transform: scale(1.05);
          }
        }

        @keyframes rotateShape {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes floatPath1 {
          0%, 100% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          33% {
            transform: translateX(30px) translateY(-30px) rotate(120deg);
          }
          66% {
            transform: translateX(-20px) translateY(20px) rotate(240deg);
          }
        }

        @keyframes floatPath2 {
          0%, 100% { 
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          33% {
            transform: translateX(-40px) translateY(40px) rotate(-120deg);
          }
          66% {
            transform: translateX(50px) translateY(-20px) rotate(-240deg);
          }
        }

        @keyframes glowPulse {
          0%, 100% { 
            filter: blur(40px) brightness(1);
            transform: scale(1); 
          }
          50% { 
            filter: blur(60px) brightness(1.2);
            transform: scale(1.1); 
          }
        }

        @keyframes subtleFloat {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-30px);
          }
        }

        @keyframes gradientShift {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }

        .animate-float-path-1 {
          animation: floatPath1 20s ease-in-out infinite;
        }

        .animate-float-path-2 {
          animation: floatPath2 25s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glowPulse 4s ease-in-out infinite;
        }

        .animate-subtle-float {
          animation: subtleFloat 6s ease-in-out infinite;
        }

        .animate-gradient-shift {
          animation: gradientShift 8s ease infinite;
          background-size: 200% 200%;
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="relative min-h-screen text-slate-900 overflow-hidden">
        {/* Modern Animated Background - More Visible but Professional */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient layer - more vibrant */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50" />
          
          {/* Animated gradient mesh - more visible */}
          <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-tr from-purple-100/30 via-transparent to-indigo-100/30" />
          
          {/* More visible floating gradient orbs */}
          <div className="absolute top-20 left-[10%] w-96 h-96 animate-subtle-float">
            <div className="w-full h-full bg-gradient-to-br from-purple-200/40 to-indigo-200/30 rounded-full blur-2xl" />
          </div>
          
          <div className="absolute bottom-20 right-[15%] w-80 h-80 animate-subtle-float" style={{ animationDelay: '2s' }}>
            <div className="w-full h-full bg-gradient-to-tr from-indigo-200/35 to-purple-200/25 rounded-full blur-2xl" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] animate-subtle-float" style={{ animationDelay: '4s' }}>
            <div className="w-full h-full bg-gradient-to-br from-purple-100/30 to-indigo-100/20 rounded-full blur-3xl" />
          </div>
          
          {/* Additional subtle orbs for depth */}
          <div className="absolute top-3/4 left-[20%] w-64 h-64 animate-subtle-float" style={{ animationDelay: '3s' }}>
            <div className="w-full h-full bg-gradient-to-bl from-indigo-200/25 to-transparent rounded-full blur-2xl" />
          </div>
          
          <div className="absolute top-1/4 right-[25%] w-72 h-72 animate-subtle-float" style={{ animationDelay: '1s' }}>
            <div className="w-full h-full bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-2xl" />
          </div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
              style={{
                 backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px)`,
                 backgroundSize: '60px 60px'
               }} />
          
          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Animated diagonal lines for movement */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
            <div className="absolute inset-0 animate-gradient-shift"
              style={{
                   backgroundImage: `linear-gradient(45deg, transparent 48%, rgba(139, 92, 246, 0.1) 50%, transparent 52%)`,
                   backgroundSize: '30px 30px'
                 }} />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-6 right-6 z-50 md:hidden bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl shadow-2xl p-8 pt-20">
              <nav className="space-y-6">
              <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-100 py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
                <button
                onClick={() => {
                    handleWatchDemo();
                    setIsMenuOpen(false);
                }}
                  className="w-full flex items-center justify-center gap-2 py-6 text-lg font-semibold text-purple-700 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-100"
              >
                  <Play className="w-5 h-5" />
                Watch Demo
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Navigation with Lightning Bolt Logo */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-6 sm:py-12 max-w-7xl mx-auto relative z-10">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            {/* Lightning Bolt Logo */}
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              {/* Subtle glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Lightning Bolt SVG */}
              <div className="relative w-8 h-10 sm:w-12 sm:h-14 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-8 sm:w-10 sm:h-12 text-indigo-600"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(99, 102, 241, 0.1))",
                  }}
                >
                  <path
                    d="M13 1L2 15h7l-2 9 11-13h-7l2-9z"
                    fill="url(#lightningGradient)"
                    className="group-hover:filter group-hover:brightness-110 transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Text Logo */}
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                PeakPlay
              </span>
          </Link>
        </div>

        {/* Hero Section with enhanced animations */}
        <section className="relative px-4 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20 relative z-10">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Trusted by 10,000+ Athletes
                </span>
          </div>

            <h1 className="text-4xl sm:text-7xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent animate-gradient-shift">
                Transform Your Game
            </span>
              <br />
              <span className="text-slate-800">With AI-Powered Insights</span>
          </h1>

            <p className="text-lg sm:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the revolution in sports training. Track progress, connect with elite coaches, and unlock your peak performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/auth/signup">
                <Button className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
              </Link>

              <Link href="/auth/signin">
                <Button className="group relative px-8 py-6 text-lg font-semibold bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-100 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              
              <button
                onClick={handleWatchDemo}
                className="group flex items-center gap-3 px-8 py-6 text-lg font-semibold text-purple-700 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-purple-100"
              >
                <div className="relative">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
                Watch Demo
              </button>
          </div>
        </div>

          {/* Feature badges with subtle animation */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 relative z-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base font-medium text-slate-700">{feature.text}</span>
          </div>
            ))}
            </div>

          {/* Role Cards with subtle effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {roles.map((role, index) => (
                  <div
                    key={role.id}
                onClick={() => handleRoleCardClick(role.title)}
                className={`group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transform transition-all duration-500 cursor-pointer overflow-hidden ${
                  activeIndex === index ? "scale-[1.02] shadow-xl" : "hover:scale-[1.01]"
                } ${role.color} ${role.borderColor} border`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Subtle animated background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
                </div>

                      <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <role.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${role.textColor} group-hover:scale-110 transition-transform`} />
                    <span className={`text-xs sm:text-sm font-bold ${role.textColor} bg-white/50 px-3 py-1 rounded-full`}>
                      {role.stats}
                    </span>
                        </div>

                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${role.textColor}`}>{role.title}</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{role.description}</p>
                  
                  <div className={`mt-6 flex items-center gap-2 ${role.textColor} font-semibold group-hover:gap-3 transition-all`}>
                    <span>Learn More</span>
                    <Target className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
            </div>

                {/* Active indicator - more subtle */}
                {activeIndex === index && (
                  <div className="absolute inset-0 border-2 border-white/20 rounded-2xl sm:rounded-3xl"></div>
                )}
              </div>
                ))}
              </div>
        </section>

        {/* Skill Pillars Section with subtle effects */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 relative overflow-hidden">
          {/* Section background - very subtle */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/10 to-transparent"></div>
        </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  The 5 Skill Pillars
                </span>
            </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                Our comprehensive approach covers every aspect of athletic development
            </p>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {skillPillars.map((pillar, index) => (
                <div
                  key={index}
                  className={`group relative p-6 rounded-2xl ${pillar.bgColor} backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {pillar.icon}
                        </div>
                    <h3 className={`text-xl font-bold mb-2 ${pillar.textColor}`}>{pillar.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coaching Marketplace Section with subtle gradient cards */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Elite Coaching Marketplace
                </span>
            </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                Connect with professional coaches who understand your goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {coachingOptions.map((option, index) => (
              <div
                  key={index}
                  className="group relative p-8 rounded-3xl bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Subtle gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${option.color} text-white mb-6 group-hover:scale-105 transition-transform duration-300`}>
                      <option.icon className="w-8 h-8" />
                </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-800">{option.title}</h3>
                    <p className="text-slate-600">{option.description}</p>
                  </div>
              </div>
            ))}
          </div>
        </div>
        </section>

        {/* Venue Section - Light Theme */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-slate-200/95 to-slate-100/95 backdrop-blur-sm rounded-xl sm:rounded-3xl p-6 sm:p-16 border border-slate-200/50 shadow-xl relative overflow-hidden">
            {/* Enhanced light background animations */}
            <div className="absolute inset-0 opacity-25">
              <div
                className="absolute w-64 h-64 bg-gradient-to-r from-indigo-200/40 to-purple-200/40 rounded-full blur-2xl animate-floating-orb"
                style={{ top: "15%", right: "10%" }}
              ></div>
              <div
                className="absolute w-48 h-48 bg-gradient-to-r from-purple-200/35 to-indigo-200/35 rounded-full blur-xl animate-floating-orb-reverse"
                style={{ bottom: "25%", left: "15%" }}
              ></div>
              <div
                className="absolute w-32 h-32 bg-gradient-to-r from-indigo-100/30 to-purple-100/30 rounded-full blur-lg animate-ambient-pulse"
                style={{ top: "40%", right: "40%" }}
              ></div>
            </div>

            <div className="text-center mb-8 sm:mb-16 relative z-10">
              <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-slate-900 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
                Find Your Perfect Venue
              </h2>
              <p className="text-lg sm:text-2xl text-slate-700 max-w-4xl mx-auto hover:text-slate-800 transition-colors duration-300 px-4 font-medium leading-relaxed">
                Never hunt for grounds, fields, or nets again—discover, compare and book the perfect venue in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 relative z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/50">
                <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-indigo-500 text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900">Interactive Map:</h3>
                <p className="text-sm sm:text-lg text-slate-700 leading-relaxed">
                  Pinpoint turf wickets, floodlit fields or all-weather nets nearby.
                </p>
            </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/50">
                <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-indigo-500 text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900">Instant Booking:</h3>
                <p className="text-sm sm:text-lg text-slate-700 leading-relaxed">
                  Real-time availability, transparent rates and secure checkout.
              </p>
            </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/50">
                <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-indigo-500 text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900">Venue Details:</h3>
                <p className="text-sm sm:text-lg text-slate-700 leading-relaxed">
                  High-res photos, pitch specs and peer ratings at a glance.
                </p>
              </div>
            </div>

            <div className="text-center relative z-10">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                Ready to play?{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Search. Book. Dominate.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 backdrop-blur-sm rounded-xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl border border-purple-400/30 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-white tracking-tight relative z-10">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="mb-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 hover:shadow-lg hover:bg-white transition-all duration-300 border border-white/20 relative z-10"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-white/98 to-indigo-50/95 backdrop-blur-sm rounded-xl sm:rounded-3xl p-4 sm:p-16 hover:shadow-xl transition-all duration-500 border border-indigo-100/60 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
              <div>
                <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
                  Contact Us
                </h2>
                <p className="text-lg sm:text-2xl text-gray-600 leading-relaxed hover:text-gray-700 transition-colors duration-300">
                  Interested in working together? Fill out some info and we will be in touch shortly. We can't wait to
                  hear from you!
                </p>
              </div>

              <div>
                <form className="space-y-3 sm:space-y-6" onSubmit={handleContactFormSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm text-xs sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm text-xs sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm text-xs sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 resize-none shadow-sm text-xs sm:text-base"
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-semibold rounded-lg sm:rounded-xl hover:scale-105 group relative overflow-hidden"
                  >
                    <span className="relative z-10">SEND</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-white backdrop-blur-sm text-gray-800 relative z-10 hover:bg-gray-50 transition-colors duration-500 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-3 md:mb-0 group cursor-pointer">
                {/* Lightning Bolt SVG - matching header */}
                <div className="relative w-4 sm:w-8 h-4 sm:h-8 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-3 sm:w-6 h-4 sm:h-7 text-indigo-600 drop-shadow-sm"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))",
                    }}
                  >
                    <path
                      d="M13 1L2 15h7l-2 9 11-13h-7l2-9z"
                      fill="url(#footerLightningGradient)"
                      className="group-hover:animate-pulse"
                    />
                    {/* Gradient definition for footer */}
                    <defs>
                      <linearGradient id="footerLightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-sm sm:text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  PeakPlay
                </span>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300">
                  © 2025 PeakPlay. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}