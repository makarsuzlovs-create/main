/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // `npm run build:static` emits a fully static bundle (out/) that can be
  // hosted anywhere. The regular server build is unaffected.
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export", trailingSlash: true } : {}),
};

export default nextConfig;
