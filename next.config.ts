import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Backend localhost:3001 — ảnh tại /uploads/**
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // Safety net: trường hợp URL có /api/uploads/ (cũ)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/uploads/**',
      },
      // Local network IP
      {
        protocol: 'http',
        hostname: '192.168.1.6',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.6',
        port: '3001',
        pathname: '/api/uploads/**',
      },
      // Google CDN (ảnh banner)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
