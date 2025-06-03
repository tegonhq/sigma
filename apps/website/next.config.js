module.exports = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  transpilePackages: ['geist', '@redplanethq/ui', 'react-tweet'],
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};
