/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  // Memory-saving optimizations for lightweight container builds
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
