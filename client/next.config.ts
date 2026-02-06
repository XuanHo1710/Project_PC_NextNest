import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Optimize compilation speed
  reactStrictMode: false, // Disable double rendering in dev

  // Reduce bundle size and compile time
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development', // Skip image optimization in dev
  },

  // Faster hot reload
  experimental: {
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      'framer-motion',
      'recharts',
      'lucide-react',
      'react-icons',
    ],
  },

  // Turbopack configuration (Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack optimization for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };

      // Reduce the number of threads
      config.parallelism = 1;

      // Cache compilation
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },

  // Transpile specific packages that cause slow builds
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-pagination',
    'rc-picker',
  ],
};

export default nextConfig;

