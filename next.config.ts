import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Images in /public sit behind the password proxy; serve them as-is so
    // the browser's access cookie applies (the optimizer fetches without it).
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
