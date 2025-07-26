"use client"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Icons */}
      <div className="absolute top-1/4 left-1/4 animate-float-up-down">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-lg rotate-12 backdrop-blur-sm"></div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float-up-down-delayed">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-1/3 left-1/3 animate-float-rotate">
        <div className="w-4 h-4 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rotate-45 backdrop-blur-sm"></div>
      </div>
    </div>
  )
} 