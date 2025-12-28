// ============================================
// NEXT.JS JAVASCRIPT - next.config.js
// ============================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_META_APP_ID: process.env.META_APP_ID,
  },
}

module.exports = nextConfig