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
  // Product photos live in public/ and are served as static assets. Never pack
  // them into serverless functions (readdir/tracing would exceed the 250MB limit).
  outputFileTracingExcludes: {
    '*': [
      './public/products/**/*.jpg',
      './public/products/**/*.jpeg',
      './public/products/**/*.png',
      './public/products/**/*.webp',
      './public/products/**/*.JPG',
      './public/products/**/*.PNG',
    ],
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
