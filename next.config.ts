import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle in .next/standalone —
  // required for the Dockerfile in this project to work.
  output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents this app from being embedded in an iframe on another
          // site (clickjacking protection) — relevant since this handles
          // client signatures and report data.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops browsers from guessing content types in ways that can
          // be exploited (e.g. a .txt upload being executed as .js).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limits how much referrer info leaks when users click links
          // out of the app (e.g. to a client's site).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disables access to camera/mic/geolocation by default; the
          // signature pad only needs canvas, not any of these.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
