/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Include Life/ in serverless bundle so PARA context is available on Vercel (talk mode, plan generation, cron).
    outputFileTracingIncludes: {
      "/api/telegram/webhook/**": ["./Life/**/*"],
      "/api/cron/**": ["./Life/**/*"],
      "/api/plan/**": ["./Life/**/*"],
    },
  },
};

export default nextConfig;
