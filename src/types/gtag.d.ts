export {};

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent',
      targetId: string | { [key: string]: any },
      config?: {
        page_path?: string;
        cookie_flags?: string;
        analytics_storage?: 'granted' | 'denied';
        [key: string]: any;
      }
    ) => void;
    dataLayer?: any[];
  }
} 