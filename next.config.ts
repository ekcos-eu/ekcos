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
