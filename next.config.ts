import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone', // Enable standalone output for Docker
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lastfm.freetls.fastly.net' },
      { protocol: 'https', hostname: '*.last.fm' },
    ],
  },
}

export default nextConfig
