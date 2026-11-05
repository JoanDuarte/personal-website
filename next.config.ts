import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Off on purpose, and only for development. StrictMode's simulated
  // unmount makes @react-three/fiber 9.5 mark the orb's root inactive and,
  // 500ms later, force-lose its WebGL context and dispose the scene, while
  // the remount reuses that same root. The orb renders black in `bun dev`
  // and fine in production. Turn this back on when fiber handles the
  // simulated remount; check by running dev with it on and looking at the orb.
  reactStrictMode: false,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // The metadata image routes read these off disk at request time. Path joins
  // built from process.cwd() are invisible to build-time tracing, so they have
  // to be declared or they get left out of the deployed function bundles.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/app/fonts/**"],
    "/twitter-image": ["./src/app/fonts/**"],
    "/apple-icon": ["./public/images/joan-avatar.jpg"],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
