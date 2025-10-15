/** @type {import('next').NextConfig} */
const SUBPATH = process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH.trim() : ''
// Ensure leading slash if provided (required by next/font and assetPrefix)
const basePath = SUBPATH && SUBPATH !== '/' ? (SUBPATH.startsWith('/') ? SUBPATH : `/${SUBPATH}`) : ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
  // When hosting under a subpath (e.g. https://site.com/quiz), set NEXT_PUBLIC_BASE_PATH="/quiz"
  // This updates both Next's routing base and asset URLs (/_next/*) to 
  // avoid chunk load errors that often manifest as "[object Event]" at runtime.
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
