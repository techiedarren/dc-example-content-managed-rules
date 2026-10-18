import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product photos come from Unsplash, which resizes images itself.
    loader: "custom",
    loaderFile: "./src/lib/products/unsplash-image-loader.ts",
  },
};

export default nextConfig;
