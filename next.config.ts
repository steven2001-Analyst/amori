import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'qysepabvnoftgtisqdic.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'randomuser.me', pathname: '/api/portraits/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
}
export default nextConfig
