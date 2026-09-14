/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.CIV_PORTAL_ANDROID_WASM_BUILD === "1",
  },
};

export default nextConfig;
