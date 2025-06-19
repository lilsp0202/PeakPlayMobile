'use client';

import { useEffect } from 'react';
import { PWAService } from '@/lib/sw-register';

interface PWAWrapperProps {
  children: React.ReactNode;
}

export default function PWAWrapper({ children }: PWAWrapperProps) {
  useEffect(() => {
    // Initialize PWA service on client side
    if (typeof window !== 'undefined') {
      PWAService.getInstance();
    }
  }, []);

  return <>{children}</>;
} 