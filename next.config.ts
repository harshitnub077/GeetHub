import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['node:sqlite', '@libsql/client'],
  reactCompiler: true,
};

export default nextConfig;
