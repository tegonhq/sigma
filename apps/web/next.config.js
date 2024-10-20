module.exports = (phase, { defaultConfig }) => {
  // Check if the build is for production (when npm run build is used)
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    reactStrictMode: false,
    transpilePackages: ['geist', '@sigma/ui'],
    devIndicators: {
      buildActivityPosition: 'bottom-right',
    },
    swcMinify: true,
    output: isProduction ? 'export' : 'standalone',
  };
};
