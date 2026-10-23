import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/reception": ["./reception-assets/shell.html"],
    "/reception/*": ["./reception-assets/shell.html", "./reception-assets/desk.*", "./reception-assets/brand.css", "./reception-assets/icon*", "./reception-assets/logo-*.svg", "./reception-assets/*.woff2", "./reception-assets/sw.js", "./reception-assets/manifest.webmanifest"],
  },
};

export default nextConfig;
