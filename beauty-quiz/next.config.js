/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid static export in development to keep a single consistent Webpack runtime
  // If you need static export for prod, set this via env flag in your build script
  ...(process.env.NEXT_STATIC_EXPORT === '1' ? { output: 'export', trailingSlash: true } : {}),
  outputFileTracingRoot: __dirname,
  images: { unoptimized: true },
  webpack: (config, { isServer, dev }) => {
    // Only mark server-only packages as externals on the server build.
    // Doing this on the client can break the runtime and cause __webpack_modules__ errors.
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-functions': 'commonjs firebase-functions',
        'firebase-admin': 'commonjs firebase-admin',
      });
    }
    return config;
  },
}

module.exports = nextConfig
