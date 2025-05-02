module.exports = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  transpilePackages: ['geist', '@tegonhq/ui'],
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};
