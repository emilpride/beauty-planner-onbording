/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [],
    unoptimized: true
  },
  output: 'export'
};
module.exports = nextConfig;
