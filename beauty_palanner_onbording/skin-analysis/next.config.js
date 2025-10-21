/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: '/api/skin-analysis',
        destination: 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/skinAnalysis',
      },
      {
        source: '/api/skin-analysis/upload',
        destination: 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/skinAnalysisUpload',
      },
    ]
  },
}

module.exports = nextConfig
