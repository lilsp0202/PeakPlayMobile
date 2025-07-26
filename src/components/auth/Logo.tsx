import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link
      href="/dashboard"
      className={`flex items-center group transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className="flex items-center">
        {/* Lightning bolt icon matching the original PeakPlay branding */}
        <div className="relative">
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
        </div>
        {showText && (
          <div className="ml-3">
            <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent`}>
              PeakPlay
            </span>
          </div>
        )}
      </div>
    </Link>
  )
} 