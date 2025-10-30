import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to avoid JSX parsing issues
  experimental: {
    turbo: undefined,
  },
  // Ensure proper handling of API routes
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
