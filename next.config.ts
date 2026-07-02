import type { NextConfig } from "next";

function getSupabaseHostname(): string | null {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: supabaseHostname
    ? { remotePatterns: [{ protocol: "https", hostname: supabaseHostname }] }
    : {},
};

export default nextConfig;
