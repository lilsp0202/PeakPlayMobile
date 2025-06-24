import React from 'react';

interface PeakPlayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PeakPlayLogo: React.FC<PeakPlayLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-xl rotate-3 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-600 rounded-xl -rotate-3"></div>
        <div className="relative bg-white rounded-lg flex items-center justify-center h-full w-full shadow-lg">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">
            P
          </span>
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
        PeakPlay
      </span>
    </div>
  );
};

export default PeakPlayLogo; 