import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Genspark CLI (@genspark/cli) is invoked via child_process.spawn
  // from /api/scan — not imported. Next.js's file tracer only follows
  // explicit imports, so we tell it to include the CLI's dist/ files in
  // the serverless function bundle explicitly.
  outputFileTracingIncludes: {
    "/api/scan": ["./node_modules/@genspark/cli/dist/**"],
  },
  // Mark @genspark/cli as an external package — we don't want Next.js to
  // bundle its source into our route's JS. Keeps it intact in node_modules
  // at runtime so the spawn() target resolves correctly.
  serverExternalPackages: ["@genspark/cli"],
};

export default nextConfig;
