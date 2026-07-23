import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle in .next/standalone —
  // this is what makes the Docker image small and fast to start.
  // Required for the Dockerfile in this project to work.
  output: "standalone",
};

export default nextConfig;
