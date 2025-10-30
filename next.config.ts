import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of API routes and external packages
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
