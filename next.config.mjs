/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript is enabled by default in Next.js, no need for explicit compiler config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Local images in public directory don't need configuration
  },
};

export default nextConfig;