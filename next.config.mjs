/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zfpkgfuelpoxebaccqsr.supabase.co',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days cache
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
  },
};

export default nextConfig;
