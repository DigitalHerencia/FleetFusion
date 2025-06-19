/** @format */

import path from "path"

// Environment-aware CSP configuration
const isDevelopment = process.env.NODE_ENV === "development"

const getCSPValue = () => {
    if (isDevelopment) {
        // More permissive CSP for development to allow HMR and Clerk
        return [
            "default-src 'self'",
            "img-src 'self' https: data: blob:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://checkout.stripe.com",
            "style-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://fonts.googleapis.com",
            "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://api.mapbox.com wss: ws: https://checkout.stripe.com",
            "font-src 'self' https://*.clerk.com https://*.clerk.dev https://fonts.gstatic.com",
            "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://checkout.stripe.com",
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self' https://*.clerk.com https://*.clerk.dev",
        ].join("; ")
    } else {
        // Production CSP - more restrictive
        return [
            "default-src 'self'",
            "img-src 'self' https: data:",
            "script-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://checkout.stripe.com",
            "style-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://fonts.googleapis.com",
            "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://api.mapbox.com https://checkout.stripe.com",
            "font-src 'self' https://*.clerk.com https://*.clerk.dev https://fonts.gstatic.com",
            "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://checkout.stripe.com",
            "worker-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self' https://*.clerk.com https://*.clerk.dev",
        ].join("; ")
    }
}

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: getCSPValue(),
    },
]

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false, // Remove X-Powered-By header

    images: {
        // Enhanced image optimization for Next.js 15
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fleet-fusion.vercel.app",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.clerk.dev",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.clerk.accounts.dev",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.clerk.dev",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "api.mapbox.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3000",
                pathname: "/**",
            },
            // Added for Clerk CAPTCHA and Google images
            {
                protocol: "https",
                hostname: "www.google.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "www.gstatic.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.clerk.com",
                pathname: "/**",
            },
        ],
        // Optimized settings for Next.js 15 Image component
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true, // Allow SVG for icons
        contentDispositionType: "inline", // Change from attachment to inline
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
        // Add loader for better performance
        loader: "default", // Disable static imports for better dynamic loading
        unoptimized: false,
    },

    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }]
    },

    // Turbopack configuration (moved from experimental.turbo)
    turbopack: {
        // Enable Turbo for faster builds (optional)
        rules: {
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js",
            },
        },
    },
    experimental: {
        // Next.js 15 specific features
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "fleet-fusion.vercel.app",
                "liberal-gull-quietly.ngrok-free.app:3000",
            ],
            bodySizeLimit: "2mb",
        },
        // PPR (Partial Prerendering) requires Next.js canary version
        // ppr: 'incremental',
        // Optimized package imports
        optimizePackageImports: ["lucide-react", "@clerk/nextjs"],
        // Enable webpack build worker to improve build performance
        webpackBuildWorker: true,
    },

    // Next.js 15 specific configurations
    typescript: {
        // Type-check during builds
        ignoreBuildErrors: true,
    },

    eslint: {
        // Lint during builds
        ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer, dev }) => {
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            "@": path.resolve(__dirname),
        }

        // Optimize webpack cache configuration to prevent large string serialization warnings
        if (dev && config.cache && config.cache.type === "filesystem") {
            config.cache = {
                ...config.cache,
                // Improve cache performance by using better compression and memory management
                compression: "gzip",
                hashAlgorithm: "xxhash64",
                // Enable cache serialization optimization
                store: "pack",
                // Optimize pack strategy to reduce large string serialization
                buildDependencies: {
                    config: [__filename],
                },
                // Set memory limits to prevent excessive string caching
                memoryCacheUnaffected: true,
                maxMemoryGenerations: 1,
            }
        }

        // Optimize webpack module resolution for better performance
        config.resolve = {
            ...config.resolve,
            // Cache module resolution for better performance
            unsafeCache: false,
            symlinks: false,
        }

        // Optimize chunk splitting to reduce large bundle serialization
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    ...config.optimization.splitChunks,
                    chunks: "all",
                    cacheGroups: {
                        ...config.optimization.splitChunks?.cacheGroups,
                        // Create smaller chunks to reduce serialization impact
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendors",
                            chunks: "all",
                            maxSize: 200000, // 200KB max chunk size
                        },
                        common: {
                            name: "common",
                            minChunks: 2,
                            chunks: "all",
                            maxSize: 200000,
                            enforce: true,
                        },
                    },
                },
            }
        }

        if (isServer) {
            // Ensure Prisma client is bundled only for the server
            config.externals = [...(config.externals || []), "@prisma/client"]
        }

        return config
    },
} satisfies import("next").NextConfig

export default nextConfig
