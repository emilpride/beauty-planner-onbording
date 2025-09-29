/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      'firebase-functions': 'commonjs firebase-functions',
      'firebase-admin': 'commonjs firebase-admin',
    });
    return config;
  },
}

module.exports = nextConfig
