/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.yourcoursesite.com', // example: where thumbnails or videos may come from
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // if you plan to use Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase storage for course media
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
  },
};

module.exports = nextConfig;
