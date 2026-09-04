import {Open_Sans} from 'next/font/google'
import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import {SITE_URL} from '@/lib/brand'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
}

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
