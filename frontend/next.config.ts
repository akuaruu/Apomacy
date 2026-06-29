import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menambahkan jalur proxy (rewrites) untuk mengatasi masalah CORS / Mixed Content
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Arahkan ke backend Golang di server VPS 
        destination: 'http://159.223.82.138:8080/api/:path*', 
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