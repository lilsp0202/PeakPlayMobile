"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Reusable clickable logo component
export const PeakPlayLogo = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-11 w-11", 
    large: "h-16 w-16"
  };
  
  const iconSizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-10 w-10"
  };
  
  const textSizeClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-4xl"
  };

  return (
    <Link href="/dashboard" className="flex items-center group transition-all duration-300 hover:scale-105">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <svg
            className={`${iconSizeClasses[size]} text-white`}
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
        <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
      </div>
      <div className="ml-3">
        <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent`}>
          PeakPlay
        </span>
        {size === "large" && (
          <p className="text-xs text-gray-500 font-medium">Athletic Excellence</p>
        )}
      </div>
    </Link>
  );
};

// Reusable back button component
export const BackButton = ({ 
  text = "Back", 
  onClick,
  className = ""
}: { 
  text?: string;
  onClick?: () => void;
  className?: string;
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 ${className}`}
    >
      <ArrowLeft className="h-5 w-5" />
      <span>{text}</span>
    </button>
  );
};

// Enhanced back button with styling
export const StyledBackButton = ({ 
  text = "Back", 
  onClick,
  className = ""
}: { 
  text?: string;
  onClick?: () => void;
  className?: string;
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 ${className}`}
    >
      <ArrowLeft className="h-5 w-5 text-gray-600" />
      <span className="text-gray-700 font-medium">{text}</span>
    </button>
  );
};

// Page header component with logo and back button
export const PageHeader = ({ 
  title, 
  subtitle,
  showBackButton = true,
  backButtonText = "Back",
  onBackClick
}: {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <PeakPlayLogo size="default" />
        {showBackButton && (
          <StyledBackButton text={backButtonText} onClick={onBackClick} />
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-lg">{subtitle}</p>
        )}
      </div>
    </div>
  );
}; 