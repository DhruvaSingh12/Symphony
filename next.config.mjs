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
    },
  };
  
  export default nextConfig;
  