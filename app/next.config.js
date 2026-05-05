/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for some wallet adapter / web3.js dependencies
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
