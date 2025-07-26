"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PeakPlayLogoProps {
  size?: "small" | "default" | "large";
  variant?: "light" | "dark" | "gradient";
  showTagline?: boolean;
  className?: string;
}

export function PeakPlayLogo({ 
  size = "default", 
  variant = "gradient",
  showTagline = true,
  className = "" 
}: PeakPlayLogoProps) {
  const sizeClasses = {
    small: {
      icon: "w-6 h-6",
      iconContainer: "w-8 h-8",
      title: "text-lg",
      tagline: "text-xs"
    },
    default: {
      icon: "w-6 h-6", 
      iconContainer: "w-10 h-10",
      title: "text-2xl",
      tagline: "text-sm"
    },
    large: {
      icon: "w-8 h-8",
      iconContainer: "w-12 h-12", 
      title: "text-3xl",
      tagline: "text-base"
    }
  };

  const variantClasses = {
    light: {
      iconBg: "bg-gradient-to-br from-purple-100 to-blue-100",
      iconColor: "text-purple-600",
      title: "text-gray-800",
      tagline: "text-gray-600"
    },
    dark: {
      iconBg: "bg-gradient-to-br from-gray-800 to-gray-900",
      iconColor: "text-white",
      title: "text-white",
      tagline: "text-gray-300"
    },
    gradient: {
      iconBg: "bg-gradient-to-br from-purple-500 to-blue-600",
      iconColor: "text-white",
      title: "text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text",
      tagline: "text-gray-600"
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <Link href="/landing">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={`flex items-center space-x-3 ${className}`}
      >
        {/* Lightning Bolt Icon */}
        <motion.div 
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
          className={`${currentSize.iconContainer} ${currentVariant.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <svg 
            className={`${currentSize.icon} ${currentVariant.iconColor}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.div>
        
        {/* Brand Text */}
        <div className="flex flex-col">
          <motion.h1 
            className={`${currentSize.title} font-bold ${currentVariant.title} leading-tight`}
          >
            PeakPlay
          </motion.h1>
          {showTagline && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${currentSize.tagline} ${currentVariant.tagline} font-medium leading-tight`}
            >
              Peak Performance Platform
            </motion.p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default PeakPlayLogo; 