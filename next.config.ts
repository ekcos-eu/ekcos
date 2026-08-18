import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  // Product photos and hero video live in public/ and are served as static CDN
  // assets. Never pack them into serverless functions.
  outputFileTracingExcludes: {
    '*': [
      './public/products/**/*.jpg',
      './public/products/**/*.jpeg',
      './public/products/**/*.png',
      './public/products/**/*.webp',
      './public/products/**/*.JPG',
      './public/products/**/*.PNG',
      './public/videos/**',
    ],
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/:locale/custom-branding',
        destination: 'https://eshop.ekcos.eu/pages/custom-branding',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
