import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",

  basePath: isGitHubPages ? "/WEB" : "",

  trailingSlash: true,

  images: {
    unoptimized: true
  },

  reactStrictMode: true,

  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["react", "react-dom"]
  }
};

export default nextConfig;
