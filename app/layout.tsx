import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexProvider } from './ConvexProvider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Music Lovers',
  description: 'Discover the latest from your favorite artists',
  manifest: '/manifest.webmanifest',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ConvexProvider>
          {children}
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  )
}
