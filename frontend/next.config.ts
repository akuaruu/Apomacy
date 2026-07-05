import type { NextConfig } from "next";

const DEFAULT_BACKEND_API_URL = "http://159.223.82.138:8080/api";

function getBackendApiUrl() {
  const value = (process.env.API_URL || DEFAULT_BACKEND_API_URL).replace(/\/+$/, "");
  const url = new URL(value);

  if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.endsWith('/api')) {
    throw new Error("API_URL harus berupa URL absolut dan berakhiran /api");
  }

  return value;
}

const nextConfig: NextConfig = {
  // Menambahkan jalur proxy (rewrites) untuk mengatasi masalah CORS / Mixed Content
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getBackendApiUrl()}/:path*`,
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
