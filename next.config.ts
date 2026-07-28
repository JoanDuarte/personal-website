import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // The metadata image routes read these off disk at request time. Path joins
  // built from process.cwd() are invisible to build-time tracing, so they have
  // to be declared or they get left out of the deployed function bundles.
  outputFileTracingIncludes: {
    "/opengraph-image": [
      "./src/app/fonts/**",
      "./public/images/messi-og.jpg",
    ],
    "/twitter-image": ["./src/app/fonts/**", "./public/images/messi-og.jpg"],
    "/apple-icon": ["./public/images/joan-avatar.jpg"],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
