const { withSentryConfig } = require("@sentry/nextjs");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/, /_middleware\.js$/, /_middleware\.js\.map$/, /\.map$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-font-assets",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/static.+\.js$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-js-assets",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  // Allow cross-origin requests from network IP
  allowedDevOrigins: [
    '192.168.1.75:3000', '192.168.1.75:3001', '192.168.1.75:3002', 
    '192.168.1.75:3003', '192.168.1.75:3004', '192.168.1.75:3005', 
    '192.168.1.75:3006', '192.168.1.75:3007', '192.168.1.75:3008'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', '192.168.1.75:3000', '192.168.1.75:3001', 
        '192.168.1.75:3002', '192.168.1.75:3003', '192.168.1.75:3004', 
        '192.168.1.75:3005', '192.168.1.75:3006', '192.168.1.75:3007', 
        '192.168.1.75:3008'
      ],
      bodySizeLimit: '2mb',
    },
    scrollRestoration: true,
  },
  // Simplified webpack configuration to prevent chunk loading errors
  webpack: (config, { isServer, dev }) => {
    // Basic fallback configuration
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        buffer: false,
        process: false,
      };
    }
    
    // Disable chunk splitting in development to prevent MODULE_NOT_FOUND errors
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
      };
    }
    
    return config;
  },
  images: {
    domains: ['localhost', 'peakplay.com'],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
  // Simplified redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

// Apply PWA first, then Sentry
const configWithPWA = withPWA(nextConfig);

module.exports = process.env.NODE_ENV === 'production' 
  ? withSentryConfig(configWithPWA, {
      org: "peakplay",
      project: "peakplay-frontend",
      silent: !process.env.CI,
      widenClientFileUpload: true,
      reactComponentAnnotation: {
        enabled: true,
      },
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : configWithPWA;
 