"use client";

import type { ImageLoaderProps } from "next/image";

/** Resizes images with Unsplash's own image API, so Next.js doesn't need to. */
export default function unsplashImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}
