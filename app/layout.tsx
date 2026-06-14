import type { Metadata } from 'next'
import { Exo_2 } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SiteHeader } from 'components/layout/SiteHeader'
import BottomNav from 'components/layout/BottomNav'
import RegisterSW from 'components/RegisterSW'

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JamFind — Discover African Music',
  description: 'Find, discover, and stream African music. Identify songs instantly, explore trending tracks across the continent, and share your weekly picks.',
  keywords: ['african music', 'music discovery', 'shazam africa', 'afrobeats', 'amapiano', 'highlife', 'streaming'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={exo2.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans min-h-screen bg-jf-surface text-white pb-16 md:pb-0">
        <Providers>
          <div className="sticky top-0 z-50">
            <SiteHeader />
          </div>
          <main>{children}</main>
          <BottomNav />
          <RegisterSW />
        </Providers>
      </body>
    </html>
  )
}
