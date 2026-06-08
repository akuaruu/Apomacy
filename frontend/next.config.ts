import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menambahkan jalur proxy (rewrites) untuk mengatasi Mixed Content 
  // dari Vercel (HTTPS) ke VPS DigitalOcean (HTTP)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://159.223.82.138:8080/api/:path*/',
        // Catatan: Pastikan port backend Apomacy benar

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
        hostname: 'localhost', // Mengizinkan gambar dari URL shortener lokalmu
      }
    ],
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;