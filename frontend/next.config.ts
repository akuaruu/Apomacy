

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menambahkan jalur proxy (rewrites) untuk mengatasi Mixed Content 
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // UBAH BAGIAN INI: Arahkan ke backend Golang lokal Anda
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