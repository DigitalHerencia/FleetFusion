import path from 'path';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https: data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.clerk.com https://*.clerk.dev",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
  
  images: {
    // Enhanced image optimization for Next.js 15
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fleet-fusion.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.accounts.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Added for Clerk CAPTCHA and Google images
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.com',
        pathname: '/**',
      },
    ],
    // Optimized settings for Next.js 15 Image component
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true, // Allow SVG for icons
    contentDispositionType: 'inline', // Change from attachment to inline
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add loader for better performance
    loader: 'default',    // Disable static imports for better dynamic loading
    unoptimized: false,
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    // Enable Turbo for faster builds (optional)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  experimental: {
    // Next.js 15 specific features
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'fleet-fusion.vercel.app',
        'liberal-gull-quietly.ngrok-free.app:3000',
      ],
      bodySizeLimit: '2mb',
    },
    // PPR (Partial Prerendering) requires Next.js canary version
    // ppr: 'incremental',
    // Optimized package imports
    optimizePackageImports: ['lucide-react', '@clerk/nextjs'],
  },
  
  // Next.js 15 specific configurations
  typescript: {
    // Type-check during builds
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Lint during builds
    ignoreDuringBuilds: false,
  },
  
  // Compiler options for Next.js 15
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    if (isServer) {
      // Ensure Prisma client is bundled only for the server
      config.externals = [...(config.externals || []), '@prisma/client'];
    }
    return config;
  },
} satisfies import('next').NextConfig;

export default nextConfig;
