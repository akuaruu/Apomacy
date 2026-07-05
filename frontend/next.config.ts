import type { NextConfig } from "next";

const backendApiUrl = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Menambahkan jalur proxy (rewrites) untuk mengatasi masalah CORS / Mixed Content
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua gambar dari internet (HTTPS)
      },
      {
        protocol: 'http',
        hostname: 'localhost',  // Mengizinkan gambar dari URL shortener lokalmu
      }
    ],
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
