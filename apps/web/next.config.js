module.exports = (phase, { defaultConfig }) => {
  // Check if the build is for production (when npm run build is used)
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    webpack: (config) => {
      config.resolve.fallback = { fs: false }; // Disable server-related features
      return config;
    },
    reactStrictMode: false,
    transpilePackages: ['geist', '@sigma/ui'],
    distDir: 'build',
    devIndicators: {
      buildActivityPosition: 'bottom-right',
    },

    swcMinify: true,
    output: isProduction ? 'export' : 'standalone',
  };
};
