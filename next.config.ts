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

  /*
   * Exposed so the few plain anchors that cannot use next/link
   * (the RSS feed link) can build basePath-aware URLs at render
   * time. Inlined at build time, mirroring the basePath decision
   * above and the blog pipeline's GITHUB_ACTIONS detection.
   */
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/WEB" : ""
  },

  experimental: {
    optimizePackageImports: ["react", "react-dom"]
  }
};

export default nextConfig;
