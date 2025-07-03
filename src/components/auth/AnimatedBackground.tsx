"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/40"></div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.1)_1px,transparent_0)] [background-size:32px_32px] animate-pulse"></div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/25 to-cyan-200/25 rounded-full blur-3xl animate-float-slow"></div>

      {/* Interactive Mouse Follower */}
      <div
        className="absolute w-96 h-96 bg-gradient-to-r from-purple-300/10 to-blue-300/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      {/* Geometric Shapes */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-purple-400/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-6 h-6 bg-blue-400/20 rounded-full animate-bounce-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-indigo-400/30 rotate-45 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-ping"></div>
    </div>
  )
} 