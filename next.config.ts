import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  esLint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
