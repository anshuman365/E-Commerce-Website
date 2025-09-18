/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'via.placeholder.com', 'e-commerce-website-backend-6xku.onrender.com'],
    unoptimized: process.env.NODE_ENV === 'production' ? false : true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  // Enable static exports for deployment
  output: 'export',
  trailingSlash: true,
  // Add base path if needed for deployment
  // basePath: '/ecommerce',
}

module.exports = nextConfig