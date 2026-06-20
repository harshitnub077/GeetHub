import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['node:sqlite'],
  reactCompiler: true,
};

export default nextConfig;
