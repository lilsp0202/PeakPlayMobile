"use client"
import { useState, useEffect } from "react"
import Link from "next/link";
import type React from "react"

import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Users, Target, BarChart3, Video, MapPin, Monitor } from "lucide-react"

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

export function LandingPageContent() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % roles.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your form submission logic here
  }

  return (
    <>
      {/* Move styles to global CSS or use Tailwind classes */}
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

        .animate-lightning-pulse {
          animation: lightningPulse 2s ease-in-out infinite alternate;
        }

        .animate-lightning-glow {
          animation: lightningGlow 1.5s ease-in-out infinite alternate;
        }

        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
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
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Professional Animated Background System */}
        <div className="fixed inset-0 -z-10">
          {/* Base Professional Gradient */}
          <div
            className="absolute inset-0 animate-professional-gradient"
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

          {/* Dynamic Mesh Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-40 animate-mesh-shift"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 90% 60%, rgba(168, 85, 247, 0.07) 0%, transparent 50%)
              `,
            }}
          />

          {/* Animated Geometric Patterns */}
          <div className="absolute inset-0">
            {/* Large Floating Orbs */}
            <div
              className="absolute w-96 h-96 rounded-full opacity-20 animate-floating-orb"
              style={{
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)",
                top: "10%",
                left: "5%",
              }}
            />

            <div
              className="absolute w-80 h-80 rounded-full opacity-15 animate-floating-orb-reverse"
              style={{
                background:
                  "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.04) 40%, transparent 70%)",
                top: "60%",
                right: "8%",
              }}
            />

            <div
              className="absolute w-64 h-64 rounded-full opacity-18 animate-floating-orb-alt"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.03) 40%, transparent 70%)",
                bottom: "20%",
                left: "20%",
              }}
            />

            {/* Professional Grid Pattern */}
            <div
              className="absolute inset-0 opacity-8 animate-grid-flow"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Diagonal Light Streaks */}
            <div
              className="absolute inset-0 opacity-6 animate-diagonal-flow"
              style={{
                background: `
                  linear-gradient(45deg, transparent 48%, rgba(99, 102, 241, 0.04) 50%, transparent 52%),
                  linear-gradient(-45deg, transparent 48%, rgba(168, 85, 247, 0.03) 50%, transparent 52%)
                `,
                backgroundSize: "200px 200px",
              }}
            />

            {/* Morphing Shapes */}
            <div
              className="absolute w-40 h-40 opacity-12 animate-morphing-shape"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04), rgba(139, 92, 246, 0.06), rgba(99, 102, 241, 0.08))",
                top: "30%",
                right: "30%",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              }}
            />

            <div
              className="absolute w-32 h-32 opacity-10 animate-morphing-shape-reverse"
              style={{
                background:
                  "conic-gradient(from 180deg, rgba(168, 85, 247, 0.06), rgba(139, 92, 246, 0.03), rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.06))",
                bottom: "35%",
                right: "15%",
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              }}
            />

            {/* Floating Particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-30"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  background: `rgba(${i % 2 === 0 ? "99, 102, 241" : "168, 85, 247"}, 0.4)`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `floatingParticle ${15 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${Math.random() * 15}s`,
                }}
              />
            ))}

            {/* Ambient Light Spots */}
            <div
              className="absolute w-72 h-72 rounded-full opacity-8 animate-ambient-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.02) 30%, transparent 60%)",
                top: "15%",
                right: "10%",
              }}
            />

            <div
              className="absolute w-56 h-56 rounded-full opacity-6 animate-ambient-pulse-reverse"
              style={{
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.015) 30%, transparent 60%)",
                bottom: "15%",
                left: "10%",
              }}
            />

            {/* Professional Wave Pattern */}
            <div
              className="absolute inset-0 opacity-4 animate-wave-pattern"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 150px,
                    rgba(99, 102, 241, 0.02) 150px,
                    rgba(99, 102, 241, 0.02) 151px
                  )
                `,
              }}
            />
          </div>
        </div>

        {/* Navigation with enhanced styling */}
        <div className="flex items-center justify-center px-8 py-12 max-w-7xl mx-auto relative z-10 mt-6">
          {/* Logo positioned directly on page background */}
          <div className="flex items-center gap-3 group cursor-pointer relative z-20">
            {/* Standalone Lightning Bolt - no container box */}
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-indigo-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse blur-lg"></div>

              {/* Lightning Bolt SVG - standalone */}
              <div className="relative w-14 h-16 flex items-center justify-center group-hover:scale-105 transition-all duration-500">
                {/* Animated Lightning Bolt SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-12 h-14 text-indigo-600 drop-shadow-lg animate-lightning-pulse"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))",
                  }}
                >
                  <path
                    d="M13 1L2 15h7l-2 9 11-13h-7l2-9z"
                    fill="url(#lightningGradient)"
                    className="group-hover:animate-pulse animate-lightning-glow"
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
                  <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full -translate-x-1/2 -translate-y-1 animate-sparkle"></div>
                  <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-blue-300 rounded-full animate-sparkle-delay-1"></div>
                  <div className="absolute top-1/2 -left-2 w-1 h-1 bg-purple-300 rounded-full -translate-y-1/2 animate-sparkle-delay-2"></div>
                  <div className="absolute top-1/4 right-0 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-sparkle-delay-3"></div>
                </div>

                {/* Enhanced rotating glow effect */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl animate-spin"
                  style={{ animationDuration: "8s" }}
                ></div>
              </div>
            </div>

            {/* Enhanced text logo */}
            <div className="flex flex-col items-center relative">
              {/* Main text with enhanced gradient */}
              <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-indigo-800 transition-all duration-500 relative">
                PeakPlay
                {/* Subtle text shadow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-700/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </span>

              {/* Animated underline with gradient */}
              <div className="h-1 w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 group-hover:w-full transition-all duration-700 rounded-full relative overflow-hidden">
                {/* Shimmer effect on underline */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>

              {/* Subtle tagline that appears on hover */}
              <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-70 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 font-medium tracking-wide">
                Peak Performance Platform
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with enhanced animations */}
        <div className="text-center px-6 py-16 max-w-6xl mx-auto relative z-10">
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-md hover:shadow-lg hover:bg-white/85 hover:scale-105 transition-all duration-300 cursor-pointer group"
                style={{
                  animation: `scaleIn 0.6s ease-out forwards`,
                  animationDelay: `${0.2 + index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <feature.icon className="w-4 h-4 text-indigo-600 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-slate-800 hover:scale-105 transition-transform duration-500 cursor-default">
            Unlock Your
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 transition-all duration-500">
              Peak Performance.
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed hover:text-slate-700 transition-colors duration-300">
            Redefining youth sports development with a future-forward platform that's purposeful,
            performance-measurable, and makes the journey unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg group relative overflow-hidden hover:scale-105 touch-manipulation min-h-[44px] min-w-[44px] rounded-lg font-semibold"
            >
              <span className="relative z-10 flex items-center">
                Get Started
              </span>
              {/* Professional animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/auth/signin"
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg group relative overflow-hidden hover:scale-105 touch-manipulation min-h-[44px] min-w-[44px] rounded-lg font-semibold"
            >
              <span className="relative z-10 flex items-center">
                Sign In
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Sliding Stack Component */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6 text-slate-800 hover:scale-105 transition-transform duration-500 cursor-default">
              Tailored Solutions for Every Role
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto hover:text-slate-700 transition-colors duration-300">
              Whether you're an athlete, coach, or parent, PeakPlay adapts to your unique needs with personalized
              dashboards and insights.
            </p>
          </div>

          <div className="relative flex justify-center items-center min-h-[650px] overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="absolute w-96 h-96 bg-gradient-to-r from-indigo-100/40 via-purple-100/40 to-indigo-100/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-100/30 via-indigo-100/30 to-purple-100/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Cards Container */}
            <div className="relative w-full h-[500px] md:h-[500px] flex justify-center items-center px-4">
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
                  transform = "translateX(-280px) translateY(20px)"
                  zIndex = 20
                  opacity = 0.7
                  scale = 0.85
                } else if (isNext) {
                  transform = "translateX(280px) translateY(20px)"
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
                    className={`absolute w-full max-w-[600px] md:w-[600px] h-80 ${role.color} rounded-3xl shadow-xl transition-all duration-700 ease-out cursor-pointer hover:shadow-2xl border ${role.borderColor} backdrop-blur-sm group mx-4`}
                    style={{
                      transform: `${transform} scale(${scale})`,
                      zIndex,
                      opacity,
                      willChange: "transform, opacity",
                    }}
                    onClick={() => {
                      setActiveIndex(index)
                    }}
                  >
                    <div className="p-6 md:p-10 h-full flex flex-col justify-between relative overflow-hidden">
                      {/* Enhanced background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl group-hover:from-white/50 transition-all duration-300"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="p-2 md:p-3 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/50 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <IconComponent className={`w-5 h-5 md:w-7 md:h-7 ${role.textColor}`} />
                          </div>
                          <h3
                            className={`text-2xl md:text-3xl font-bold ${role.textColor} transition-all duration-500 ${
                              isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                            }`}
                          >
                            {role.title}
                          </h3>
                        </div>

                        <p
                          className={`leading-relaxed font-bold text-lg md:text-xl ${role.textColor} mb-4 transition-all duration-600 ${
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

            {/* Enhanced Navigation - Mobile Optimized */}
            <div className="absolute bottom-[-80px] md:bottom-[-100px] flex flex-col items-center gap-4 z-40 px-4">
              <div className="flex gap-2 md:gap-4">
                {roles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index)
                    }}
                    className={`relative transition-all duration-500 hover:scale-125 group touch-manipulation ${
                      index === activeIndex ? "w-8 md:w-12 h-3 md:h-4" : "w-3 md:w-4 h-3 md:h-4"
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

              {/* Enhanced Progress Bar - Mobile Optimized */}
              <div className="w-32 md:w-48 h-2 bg-slate-200 rounded-full overflow-hidden hover:h-3 transition-all duration-300 cursor-pointer group">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1200 ease-out group-hover:animate-pulse"
                  style={{
                    width: `${((activeIndex + 1) / roles.length) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs md:text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors duration-300 text-center">
                {activeIndex + 1} of {roles.length} • Auto-advancing
              </p>
            </div>
          </div>
        </div>

        {/* SkillSnap Framework Section */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 cursor-default hover:scale-105">
              SkillSnap - Our Five-Pillar Skills Framework
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto hover:text-slate-700 transition-colors duration-300">
              A comprehensive approach to athletic development, with every skill supporting your growth.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50/80 to-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 hover:shadow-lg transition-all duration-500 border border-slate-100/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                {
                  title: "Physical",
                  icon: "⚡",
                  bgColor: "bg-indigo-100/80",
                  hoverBgColor: "hover:bg-indigo-200/80",
                  textColor: "text-indigo-600",
                  hoverTextColor: "group-hover:text-indigo-700",
                  particleColor: "bg-indigo-200",
                  desc: "Assess strength, speed, and agility to build a robust foundation and reduce injury risk.",
                },
                {
                  title: "Technique",
                  icon: "🎯",
                  bgColor: "bg-purple-100/80",
                  hoverBgColor: "hover:bg-purple-200/80",
                  textColor: "text-purple-600",
                  hoverTextColor: "group-hover:text-purple-700",
                  particleColor: "bg-purple-200",
                  desc: "Analyze movement patterns to refine skills for better precision and execution.",
                },
                {
                  title: "Tactical",
                  icon: "👁️",
                  bgColor: "bg-indigo-100/80",
                  hoverBgColor: "hover:bg-indigo-200/80",
                  textColor: "text-indigo-600",
                  hoverTextColor: "group-hover:text-indigo-700",
                  particleColor: "bg-indigo-200",
                  desc: "Evaluate game awareness and decision-making for strategic advantage.",
                },
                {
                  title: "Mental",
                  icon: "🧠",
                  bgColor: "bg-purple-100/80",
                  hoverBgColor: "hover:bg-purple-200/80",
                  textColor: "text-purple-600",
                  hoverTextColor: "group-hover:text-purple-700",
                  particleColor: "bg-purple-200",
                  desc: "Measure focus, resilience, and confidence to excel under pressure.",
                  colStart: "xl:col-start-4",
                },
                {
                  title: "Nutrition",
                  icon: "🍎",
                  bgColor: "bg-indigo-100/80",
                  hoverBgColor: "hover:bg-indigo-200/80",
                  textColor: "text-indigo-600",
                  hoverTextColor: "group-hover:text-indigo-700",
                  particleColor: "bg-indigo-200",
                  desc: "Guide healthy eating habits that fuel performance and recovery.",
                  colStart: "xl:col-start-5",
                },
              ].map((skill, index) => (
                <div
                  key={skill.title}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-3 cursor-pointer relative overflow-hidden border border-slate-100/60 ${skill.colStart || ""}`}
                  style={{
                    animation: "fadeInUp 0.6s ease-out forwards",
                    animationDelay: `${0.1 + index * 0.1}s`,
                    opacity: 0,
                    transform: "translateY(30px)",
                  }}
                >
                  {/* Enhanced background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${skill.bgColor.split("-")[1]}-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                  ></div>

                  {/* Subtle floating particles effect */}
                  <div
                    className={`absolute top-4 right-4 w-2 h-2 ${skill.particleColor} rounded-full opacity-0 group-hover:opacity-60 transition-all duration-700 group-hover:animate-bounce`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  ></div>

                  <div className="relative z-10">
                    <div className="mb-6 flex justify-center">
                      <div
                        className={`p-4 ${skill.bgColor} backdrop-blur-sm rounded-xl ${skill.hoverBgColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}
                      >
                        <div
                          className={`text-4xl ${skill.textColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                        >
                          {skill.icon}
                        </div>
                      </div>
                    </div>

                    <h3
                      className={`text-xl font-bold text-slate-800 mb-4 text-center ${skill.hoverTextColor} group-hover:scale-105 transition-all duration-300`}
                    >
                      {skill.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed text-center group-hover:text-slate-700 transition-colors duration-300">
                      {skill.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialized Coach Marketplace Section */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-slate-100/80 to-slate-50/80 backdrop-blur-sm rounded-3xl p-8 md:p-16 hover:shadow-lg transition-all duration-500 border border-slate-200/60">
            <div className="max-w-4xl">
              <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 cursor-default hover:scale-105">
                Specialized Coach Marketplace
              </h2>

              <h3 className="text-2xl font-semibold text-indigo-600 mb-8 hover:text-indigo-700 transition-colors duration-300">
                Preparing for specific conditions?
              </h3>

              <p className="text-xl text-slate-700 mb-12 leading-relaxed hover:text-slate-800 transition-colors duration-300">
                Unlock your cricket potential with certified coaches specializing in batting, bowling, strategy, and
                mental preparation. Whether you prefer remote sessions, in-person training, or video analysis, our
                platform connects you with the right expert at a convenient time and budget.
              </p>

              <div className="mb-12">
                <h4 className="text-2xl font-bold text-slate-800 mb-8 hover:text-indigo-700 transition-colors duration-300">
                  Diverse Coaching Options
                </h4>

                <div className="space-y-6">
                  {[
                    {
                      icon: Video,
                      title: "Video Call Sessions:",
                      desc: "Get real-time feedback from anywhere.",
                      bgColor: "bg-indigo-100/80",
                      hoverBgColor: "group-hover:bg-indigo-200/80",
                      textColor: "text-indigo-600",
                      hoverTextColor: "group-hover:text-indigo-700",
                    },
                    {
                      icon: MapPin,
                      title: "In-Person Training:",
                      desc: "Enjoy hands-on guidance tailored to you.",
                      bgColor: "bg-purple-100/80",
                      hoverBgColor: "group-hover:bg-purple-200/80",
                      textColor: "text-purple-600",
                      hoverTextColor: "group-hover:text-purple-700",
                    },
                    {
                      icon: Monitor,
                      title: "Video Analysis:",
                      desc: "Review and improve your performance effectively.",
                      bgColor: "bg-indigo-100/80",
                      hoverBgColor: "group-hover:bg-indigo-200/80",
                      textColor: "text-indigo-600",
                      hoverTextColor: "group-hover:text-indigo-700",
                    },
                  ].map((option, index) => (
                    <div
                      key={index}
                      className="group hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 ${option.bgColor} backdrop-blur-sm rounded-xl ${option.hoverBgColor} transition-all duration-300 group-hover:scale-110 shadow-sm`}
                        >
                          <option.icon className={`w-6 h-6 ${option.textColor}`} />
                        </div>
                        <div>
                          <h5
                            className={`text-lg font-bold text-slate-800 mb-2 ${option.hoverTextColor} transition-colors duration-300`}
                          >
                            {option.title}
                          </h5>
                          <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                            {option.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Find Your Perfect Venue Section */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-slate-100/80 to-slate-50/80 backdrop-blur-sm rounded-3xl p-8 md:p-16 hover:shadow-lg transition-all duration-500 border border-slate-200/60">
            <div className="max-w-4xl">
              <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 cursor-default hover:scale-105">
                Find Your Perfect Venue
              </h2>

              <p className="text-xl text-slate-700 mb-12 leading-relaxed hover:text-slate-800 transition-colors duration-300">
                Never hunt for grounds, fields, or nets again—discover, compare and book the perfect venue in seconds.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    title: "Interactive Map:",
                    desc: "Pinpoint turf wickets, floodlit fields or all-weather nets nearby.",
                    bgColor: "bg-indigo-100/80",
                    hoverBgColor: "group-hover:bg-indigo-200/80",
                    iconColor: "bg-indigo-600",
                    hoverTextColor: "group-hover:text-indigo-700",
                  },
                  {
                    title: "Instant Booking:",
                    desc: "Real-time availability, transparent rates and secure checkout.",
                    bgColor: "bg-purple-100/80",
                    hoverBgColor: "group-hover:bg-purple-200/80",
                    iconColor: "bg-purple-600",
                    hoverTextColor: "group-hover:text-purple-700",
                  },
                  {
                    title: "Venue Details:",
                    desc: "High-res photos, pitch specs and peer ratings at a glance.",
                    bgColor: "bg-indigo-100/80",
                    hoverBgColor: "group-hover:bg-indigo-200/80",
                    iconColor: "bg-indigo-600",
                    hoverTextColor: "group-hover:text-indigo-700",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 ${feature.bgColor} backdrop-blur-sm rounded-xl ${feature.hoverBgColor} transition-all duration-300 group-hover:scale-110 shadow-sm`}
                      >
                        <div className={`w-6 h-6 ${feature.iconColor} rounded-md`}></div>
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold text-slate-800 mb-2 ${feature.hoverTextColor} transition-colors duration-300`}
                        >
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-left">
                <p className="text-lg text-slate-700 mb-6 font-medium">
                  Ready to play? <span className="font-bold text-slate-800">Search. Book. Dominate.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-16 text-white hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full translate-y-40 -translate-x-40 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-5xl font-bold mb-12 hover:scale-105 transition-transform duration-500 cursor-default">
                  Our Values
                </h2>
              </div>

              <div className="space-y-8">
                {[
                  {
                    title: "Athlete-Centric Growth",
                    desc: "We nurture the whole athlete—physical, mental and emotional.",
                  },
                  { title: "Empowered Coaching", desc: "Tools and insights that amplify mentorship and trust." },
                  { title: "Equity in Access", desc: "High-quality training for every community." },
                  { title: "Joy in the Journey", desc: "Balance discipline with curiosity and fun." },
                  { title: "Integrity Through Data", desc: "Transparent metrics you can rely on." },
                ].map((value, index) => (
                  <div
                    key={index}
                    className="group hover:scale-105 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-100 transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-indigo-100 leading-relaxed group-hover:text-white transition-colors duration-300">
                      {value.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="px-6 py-16 max-w-7xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-slate-100/80 to-slate-50/80 backdrop-blur-sm rounded-3xl p-8 md:p-16 hover:shadow-lg transition-all duration-500 border border-slate-200/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 cursor-default hover:scale-105">
                  Contact Us
                </h2>
                <p className="text-xl text-slate-700 leading-relaxed hover:text-slate-800 transition-colors duration-300">
                  Interested in working together? Fill out some info and we will be in touch shortly. We can't wait to
                  hear from you!
                </p>
              </div>

              <div>
                <form className="space-y-6" onSubmit={handleContactFormSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 resize-none shadow-sm"
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl hover:scale-105 group relative overflow-hidden touch-manipulation min-h-[44px] min-w-[44px]"
                  >
                    <span className="relative z-10">SEND</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-slate-900/95 backdrop-blur-sm text-white relative z-10 hover:bg-slate-800/95 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0 group cursor-pointer">
                {/* Lightning Bolt SVG - matching header */}
                <div className="relative w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-7 text-indigo-400 drop-shadow-sm"
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
                <span className="text-lg font-semibold group-hover:text-indigo-300 transition-colors duration-300">
                  PeakPlay
                </span>
              </div>

              <div className="text-center md:text-right">
                <p className="text-slate-400 text-sm hover:text-slate-300 transition-colors duration-300 mb-1">
                  © 2025 PeakPlay. All rights reserved.
                </p>
                <p className="text-xs text-slate-500 hover:text-slate-400 transition-colors duration-300">
                  Made with ❤️ for athletes worldwide
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 