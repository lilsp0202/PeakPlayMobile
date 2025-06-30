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

        @keyframes floatingParticle {
          0% { 
            transform: translateY(100vh) translateX(0px) scale(0); 
            opacity: 0; 
          }
          10% { 
            opacity: 0.3; 
            transform: translateY(90vh) translateX(20px) scale(1); 
          }
          50% { 
            opacity: 0.3; 
            transform: translateY(50vh) translateX(-30px) scale(1.2); 
          }
          90% { 
            opacity: 0.3; 
            transform: translateY(10vh) translateX(25px) scale(0.8); 
          }
          100% { 
            transform: translateY(-10vh) translateX(0px) scale(0); 
            opacity: 0; 
          }
        }

        @keyframes gridFlow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        @keyframes diagonalFlow {
          0%, 100% { 
            transform: translateX(-100px) translateY(-100px); 
          }
          50% { 
            transform: translateX(100px) translateY(100px); 
          }
        }

        @keyframes ambientPulse {
          0%, 100% { 
            opacity: 0.08; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.15; 
            transform: scale(1.1); 
          }
        }

        @keyframes wavePattern {
          0% { transform: translateX(-150px) translateY(-150px); }
          100% { transform: translateX(150px) translateY(150px); }
        }

        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

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

        @keyframes lightningPulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(255,255,255,0.3));
          }
          50% { 
            transform: scale(1.05) rotate(1deg);
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
          }
        }

        @keyframes lightningGlow {
          0% { 
            filter: brightness(1) saturate(1);
          }
          100% { 
            filter: brightness(1.2) saturate(1.3);
          }
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }

        .animate-sparkle-delay-1 {
          animation: sparkle 1.2s ease-in-out infinite 0.3s;
        }

        .animate-sparkle-delay-2 {
          animation: sparkle 0.8s ease-in-out infinite 0.6s;
        }

        .animate-sparkle-delay-3 {
          animation: sparkle 1.4s ease-in-out infinite 0.9s;
        }

        .animate-professional-gradient {
          animation: professionalGradientFlow 20s ease infinite;
        }

        .animate-mesh-shift {
          animation: meshGradientShift 25s ease-in-out infinite;
        }

        .animate-floating-orb {
          animation: floatingOrb 30s ease-in-out infinite;
        }

        .animate-floating-orb-reverse {
          animation: floatingOrb 35s ease-in-out infinite reverse;
        }

        .animate-floating-orb-alt {
          animation: floatingOrb 28s ease-in-out infinite;
        }

        .animate-morphing-shape {
          animation: morphingShape 20s ease-in-out infinite, rotateShape 60s linear infinite;
        }

        .animate-morphing-shape-reverse {
          animation: morphingShape 25s ease-in-out infinite reverse, rotateShape 45s linear infinite reverse;
        }

        .animate-grid-flow {
          animation: gridFlow 40s linear infinite;
        }

        .animate-diagonal-flow {
          animation: diagonalFlow 45s ease-in-out infinite;
        }

        .animate-ambient-pulse {
          animation: ambientPulse 18s ease-in-out infinite;
        }

        .animate-ambient-pulse-reverse {
          animation: ambientPulse 22s ease-in-out infinite reverse;
        }

        .animate-wave-pattern {
          animation: wavePattern 50s linear infinite;
        }

        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

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

        @keyframes lightningPulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(255,255,255,0.3));
          }
          50% { 
            transform: scale(1.05) rotate(1deg);
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
          }
        }

        @keyframes lightningGlow {
          0% { 
            filter: brightness(1) saturate(1);
          }
          100% { 
            filter: brightness(1.2) saturate(1.3);
          }
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }

        .animate-sparkle-delay-1 {
          animation: sparkle 1.2s ease-in-out infinite 0.3s;
        }

        .animate-sparkle-delay-2 {
          animation: sparkle 0.8s ease-in-out infinite 0.6s;
        }

        .animate-sparkle-delay-3 {
          animation: sparkle 1.4s ease-in-out infinite 0.9s;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .animate-floating-orb,
          .animate-floating-orb-reverse,
          .animate-floating-orb-alt {
            animation-duration: 20s;
          }
          
          .animate-morphing-shape,
          .animate-morphing-shape-reverse {
            animation-duration: 15s;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-professional-gradient,
          .animate-mesh-shift,
          .animate-floating-orb,
          .animate-floating-orb-reverse,
          .animate-floating-orb-alt,
          .animate-morphing-shape,
          .animate-morphing-shape-reverse,
          .animate-grid-flow,
          .animate-diagonal-flow,
          .animate-ambient-pulse,
          .animate-ambient-pulse-reverse,
          .animate-wave-pattern {
            animation: none;
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-white">
        {/* Professional Animated Background System */}
        <div className="fixed inset-0 -z-10 bg-white">
          {/* Base Professional Gradient */}
          <div
            className="absolute inset-0 animate-professional-gradient"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 1) 0%,
                  rgba(240, 240, 255, 1) 25%,
                  rgba(245, 245, 255, 1) 50%,
                  rgba(240, 240, 255, 1) 75%,
                  rgba(255, 255, 255, 1) 100%
                )
              `,
              backgroundSize: "400% 400%",
            }}
          />

          {/* Dynamic Mesh Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-30 animate-mesh-shift"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 90% 60%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
              `,
            }}
          />

          {/* Animated Geometric Patterns */}
          <div className="absolute inset-0">
            {/* Large Floating Orbs */}
            <div
              className="absolute w-64 sm:w-96 h-64 sm:h-96 rounded-full opacity-20 animate-floating-orb"
              style={{
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)",
                top: "10%",
                left: "5%",
              }}
            />
            <div
              className="absolute w-48 sm:w-80 h-48 sm:h-80 rounded-full opacity-15 animate-floating-orb-reverse"
              style={{
                background:
                  "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 40%, transparent 70%)",
                top: "60%",
                right: "8%",
              }}
            />
            <div
              className="absolute w-40 sm:w-64 h-40 sm:h-64 rounded-full opacity-15 animate-floating-orb-alt"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, rgba(139, 92, 246, 0.02) 40%, transparent 70%)",
                bottom: "20%",
                left: "20%",
              }}
            />

            {/* Professional Grid Pattern */}
            <div
              className="absolute inset-0 opacity-5 animate-grid-flow"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Diagonal Light Streaks */}
            <div
              className="absolute inset-0 opacity-5 animate-diagonal-flow"
              style={{
                background: `
                  linear-gradient(45deg, transparent 48%, rgba(99, 102, 241, 0.03) 50%, transparent 52%),
                  linear-gradient(-45deg, transparent 48%, rgba(168, 85, 247, 0.02) 50%, transparent 52%)
                `,
                backgroundSize: "200px 200px",
              }}
            />

            {/* Morphing Shapes */}
            <div
              className="absolute w-24 sm:w-40 h-24 sm:h-40 opacity-10 animate-morphing-shape"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.04), rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.06))",
                top: "30%",
                right: "30%",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              }}
            />
            <div
              className="absolute w-20 sm:w-32 h-20 sm:h-32 opacity-08 animate-morphing-shape-reverse"
              style={{
                background:
                  "conic-gradient(from 180deg, rgba(168, 85, 247, 0.05), rgba(139, 92, 246, 0.03), rgba(99, 102, 241, 0.04), rgba(168, 85, 247, 0.05))",
                bottom: "35%",
                right: "15%",
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              }}
            />

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-30"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  background: `rgba(${i % 2 === 0 ? "99, 102, 241" : "168, 85, 247"}, 0.3)`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `floatingParticle ${15 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${Math.random() * 15}s`,
                }}
              />
            ))}

            {/* Ambient Light Spots */}
            <div
              className="absolute w-48 sm:w-72 h-48 sm:h-72 rounded-full opacity-10 animate-ambient-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.02) 30%, transparent 60%)",
                top: "15%",
                right: "10%",
              }}
            />
            <div
              className="absolute w-36 sm:w-56 h-36 sm:h-56 rounded-full opacity-08 animate-ambient-pulse-reverse"
              style={{
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0.01) 30%, transparent 60%)",
                bottom: "15%",
                left: "10%",
              }}
            />

            {/* Professional Wave Pattern */}
            <div
              className="absolute inset-0 opacity-5 animate-wave-pattern"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 150px,
                    rgba(99, 102, 241, 0.015) 150px,
                    rgba(99, 102, 241, 0.015) 151px
                  )
                `,
              }}
            />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 md:hidden bg-white backdrop-blur-lg rounded-full p-3 shadow-sm border border-gray-100 hover:scale-110 transition-transform duration-300"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/98 backdrop-blur-xl md:hidden">
            <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
              <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full max-w-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300">
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

        {/* Navigation with enhanced styling */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-6 sm:py-12 max-w-7xl mx-auto relative z-10">
          {/* Logo positioned directly on page background */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer relative z-20">
            {/* Standalone Lightning Bolt - no container box */}
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-indigo-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse blur-lg"></div>

              {/* Lightning Bolt SVG - standalone */}
              <div className="relative w-8 h-10 sm:w-14 sm:h-16 flex items-center justify-center group-hover:scale-105 transition-all duration-500">
                {/* Animated Lightning Bolt SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-8 sm:w-12 sm:h-14 text-indigo-600 drop-shadow-sm animate-lightning-pulse"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.2))",
                  }}
                >
                  <path
                    d="M13 1L2 15h7l-2 9 11-13h-7l2-9z"
                    fill="url(#lightningGradient)"
                    className="group-hover:animate-lightning-glow"
                  />
                  {/* Inner lightning highlight */}
                  <path
                    d="M13 1L2 15h7l-2 9 11-13h-7l2-9z"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="0.5"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Lightning spark effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-yellow-300/50 rounded-full -translate-x-1/2 -translate-y-1 animate-sparkle"></div>
                  <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-blue-300/50 rounded-full animate-sparkle-delay-1"></div>
                  <div className="absolute top-1/2 -left-2 w-1 h-1 bg-purple-300/50 rounded-full -translate-y-1/2 animate-sparkle-delay-2"></div>
                  <div className="absolute top-1/4 right-0 w-0.5 h-0.5 bg-indigo-300/50 rounded-full animate-sparkle-delay-3"></div>
                </div>

                {/* Enhanced rotating glow effect */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl animate-spin"
                  style={{ animationDuration: "8s" }}
                ></div>
              </div>
            </div>

            {/* Enhanced text logo */}
            <div className="flex flex-col items-center relative">
              {/* Main text with enhanced gradient */}
              <span className="text-xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-indigo-800 transition-all duration-500 relative">
                PeakPlay
                {/* Subtle text shadow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-700/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </span>

              {/* Animated underline with gradient */}
              <div className="h-0.5 sm:h-1 w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 group-hover:w-full transition-all duration-700 rounded-full relative overflow-hidden">
                {/* Shimmer effect on underline */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>

              {/* Subtle tagline that appears on hover - hidden on mobile */}
              <div className="hidden sm:block text-xs text-gray-500 opacity-0 group-hover:opacity-70 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 font-medium tracking-wide">
                Peak Performance Platform
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with enhanced animations */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          {/* Feature badges */}
          <div className="flex justify-center gap-2 sm:gap-6 mb-6 sm:mb-8 flex-wrap">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-gray-100 shadow-sm hover:shadow-md hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer group text-xs sm:text-sm"
                style={{
                  animation: `scaleIn 0.6s ease-out forwards`,
                  animationDelay: `${0.2 + index * 0.1}s`,
                  opacity: 0,
                }}
                onClick={() => console.log("Feature Badge Clicked", { feature: feature.text })}
              >
                <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300" />
                <span className="font-medium text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 sm:mb-12 leading-tight text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight text-center">
            Unlock Your
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Peak Performance.
            </span>
          </h1>

          <p className="text-base sm:text-2xl text-gray-600 mb-8 sm:mb-16 max-w-4xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 px-4 font-medium">
            Redefining youth sports development with a future-forward platform that's purposeful,
            performance-measurable, and makes the journey unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg group relative overflow-hidden hover:scale-105"
              onClick={handleWatchDemo}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Play className="w-3 h-3 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </span>
              {/* Professional animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>

            <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/auth/signup" className="flex-1 sm:flex-initial">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg group relative overflow-hidden hover:scale-105">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              <Link href="/auth/signin" className="flex-1 sm:flex-initial">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
              Tailored Solutions for Every Role
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto hover:text-gray-700 transition-colors duration-300 px-4 font-medium leading-relaxed">
              Whether you're an athlete, coach, or parent, PeakPlay adapts to your unique needs with personalized
              dashboards and insights.
            </p>
          </div>

          <div className="relative flex justify-center items-center min-h-[400px] sm:min-h-[650px] overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="absolute w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-indigo-50/60 via-purple-50/60 to-indigo-50/60 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute w-32 sm:w-80 h-32 sm:h-80 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-purple-50/50 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Cards Container */}
            <div className="relative w-full h-[350px] sm:h-[500px] flex justify-center items-center">
              {roles.map((role, index) => {
                const isActive = index === activeIndex
                const isPrev = index === (activeIndex - 1 + roles.length) % roles.length
                const isNext = index === (activeIndex + 1) % roles.length

                let transform = ""
                let zIndex = 10
                let opacity = 0.4
                let scale = 0.8

                if (isActive) {
                  transform = "translateX(0px) translateY(0px)"
                  zIndex = 30
                  opacity = 1
                  scale = 1
                } else if (isPrev) {
                  transform = "translateX(-120px) translateY(20px)"
                  zIndex = 20
                  opacity = 0.7
                  scale = 0.85
                } else if (isNext) {
                  transform = "translateX(120px) translateY(20px)"
                  zIndex = 20
                  opacity = 0.7
                  scale = 0.85
                } else {
                  transform = "translateX(0px) translateY(40px)"
                  zIndex = 10
                  opacity = 0.3
                  scale = 0.75
                }

                const IconComponent = role.icon

                return (
                  <div
                    key={role.id}
                    className={`absolute w-[260px] sm:w-[600px] h-48 sm:h-80 ${role.color} rounded-xl sm:rounded-3xl shadow-lg transition-all duration-700 ease-out cursor-pointer hover:shadow-xl border ${role.borderColor} backdrop-blur-sm group`}
                    style={{
                      transform: `${transform} scale(${scale})`,
                      zIndex,
                      opacity,
                      willChange: "transform, opacity",
                    }}
                    onClick={() => {
                      setActiveIndex(index)
                      handleRoleCardClick(role.title)
                    }}
                  >
                    <div className="p-4 sm:p-10 h-full flex flex-col justify-between relative overflow-hidden">
                      {/* Enhanced background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 rounded-xl sm:rounded-3xl group-hover:from-white/70 transition-all duration-300"></div>
                      <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/30 rounded-full -translate-y-8 sm:-translate-y-16 translate-x-8 sm:translate-x-16"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
                          <div className="p-1.5 sm:p-3 bg-white/70 rounded-lg sm:rounded-2xl backdrop-blur-sm border border-white/60 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                            <IconComponent className={`w-4 h-4 sm:w-7 sm:h-7 ${role.textColor}`} />
                          </div>
                          <h3
                            className={`text-lg sm:text-3xl font-bold ${role.textColor} transition-all duration-500 ${
                              isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                            }`}
                          >
                            {role.title}
                          </h3>
                        </div>

                        <p
                          className={`leading-relaxed font-medium text-xs sm:text-xl ${role.textColor} mb-2 sm:mb-4 transition-all duration-600 ${
                            isActive ? "translate-y-0 opacity-95" : "translate-y-4 opacity-0"
                          }`}
                        >
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Enhanced Navigation */}
            <div className="absolute bottom-[-60px] sm:bottom-[-100px] flex flex-col items-center gap-2 sm:gap-4 z-40">
              <div className="flex gap-2 sm:gap-4">
                {roles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index)
                      console.log("Role Navigation Clicked", { role: role.title })
                    }}
                    className={`relative transition-all duration-500 hover:scale-125 group ${
                      index === activeIndex ? "w-6 sm:w-12 h-2 sm:h-4" : "w-2 sm:w-4 h-2 sm:h-4"
                    }`}
                  >
                    <div
                      className={`w-full h-full rounded-full transition-all duration-500 ${
                        index === activeIndex
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                          : "bg-slate-300 group-hover:bg-indigo-200"
                      }`}
                    />
                    {index === activeIndex && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-30" />
                    )}
                    {/* Professional hover glow */}
                    <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>

              {/* Enhanced Progress Bar */}
              <div className="w-24 sm:w-48 h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden hover:h-1.5 sm:hover:h-3 transition-all duration-300 cursor-pointer group">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1200 ease-out group-hover:animate-pulse"
                  style={{
                    width: `${((activeIndex + 1) / roles.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors duration-300">
                {activeIndex + 1} of {roles.length} • Auto-advancing
              </p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
              SkillSnap - Our Five-Pillar Skills Framework
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto hover:text-gray-700 transition-colors duration-300 px-4 font-medium leading-relaxed">
              A comprehensive approach to athletic development, with every skill supporting your growth.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm rounded-xl sm:rounded-3xl p-6 sm:p-16 hover:shadow-lg transition-all duration-500 border border-gray-100/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
              {skillPillars.map((skill, index) => (
                <div
                  key={skill.title}
                  className="group bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-3 cursor-pointer relative overflow-hidden border border-slate-100/60 w-full max-w-xs mx-auto"
                  style={{
                    animation: "fadeInUp 0.6s ease-out forwards",
                    animationDelay: `${0.1 + index * 0.1}s`,
                    opacity: 0,
                    transform: "translateY(30px)",
                  }}
                  onClick={() => console.log("Skill Pillar Clicked", { skill: skill.title })}
                >
                  {/* Enhanced background gradient */}
                  <div
                    className={`absolute inset-0 ${skill.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg sm:rounded-2xl`}
                  ></div>

                  {/* Subtle floating particles effect */}
                  <div
                    className={`absolute top-2 right-2 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 ${skill.particleColor} rounded-full opacity-0 group-hover:opacity-60 transition-all duration-700 group-hover:animate-bounce`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  ></div>

                  <div className="relative z-10">
                    <div className="mb-4 sm:mb-8 flex justify-center">
                      <div
                        className={`p-3 sm:p-5 ${skill.bgColor} backdrop-blur-sm rounded-xl sm:rounded-2xl hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-sm`}
                      >
                        <div
                          className={`text-2xl sm:text-5xl ${skill.textColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                        >
                          {skill.icon}
                        </div>
                      </div>
                    </div>

                    <h3
                      className={`text-base sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-6 text-center ${skill.textColor} group-hover:scale-105 transition-all duration-300`}
                    >
                      {skill.title}
                    </h3>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-center group-hover:text-slate-700 transition-colors duration-300 min-h-[3rem] sm:min-h-[4rem]">
                      {skill.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coaching Marketplace */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
              Specialized Coach Marketplace
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto hover:text-gray-700 transition-colors duration-300 px-4 font-medium leading-relaxed">
              Connect with expert coaches for personalized guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {coachingOptions.map((option, index) => (
              <div
                key={option.title}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl p-6 sm:p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${option.color} text-white mb-4`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">{option.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl p-6 sm:p-12 border border-white/50 shadow-xl">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 hover:scale-105 transition-transform duration-500 cursor-default tracking-tight">
                Find Your Perfect Venue
              </h2>
              <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto hover:text-gray-700 transition-colors duration-300 px-4 font-medium leading-relaxed">
                Never hunt for grounds, fields, or nets again—discover, compare and book the perfect venue in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {venueFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color} mb-3 sm:mb-4`} />
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{feature.title}:</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                Ready to play? <span className="font-bold">Search. Book. Dominate.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-100">
            <h2 className="text-3xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-800 tracking-tight">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {values.map((value, index) => (
                <div key={index} className="mb-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm rounded-xl sm:rounded-3xl p-4 sm:p-16 hover:shadow-lg transition-all duration-500 border border-gray-100/50">
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
                  © 2024 PeakPlay. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
