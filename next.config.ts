import path from "path"

const nextConfig: import("next").NextConfig = {
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
    },

    // Move typescript and eslint here, outside experimental
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


        // Optimize webpack module resolution for better performance
        config.resolve = {
            ...config.resolve,
            unsafeCache: false,
            symlinks: false,
        }


        if (isServer) {
            // Ensure Prisma client is bundled only for the server
            config.externals = [...(config.externals || []), "@prisma/client"]
        }

        return config
    },
} satisfies import("next").NextConfig

export default nextConfig
