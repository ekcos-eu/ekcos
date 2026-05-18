import {Open_Sans} from 'next/font/google'
import type {ReactNode} from 'react'
import './globals.css'

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
