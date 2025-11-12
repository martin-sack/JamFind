import type { Metadata } from 'next'
import { Exo_2, Orbitron } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SiteHeader } from 'components/layout/SiteHeader'
import { DevBanner } from 'components/layout/DevBanner'

const exo2 = Exo_2({ 
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JamFind: Play the Music Game',
  description: 'Compete in weekly music discovery challenges. Submit your 10 tracks, earn points, and climb the leaderboards in this music competition platform.',
  keywords: ['music game', 'competition', 'discovery', 'leaderboard', 'points', 'rewards', 'weekly challenge'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${exo2.variable} ${orbitron.variable}`}>
      <body className="font-sans min-h-screen bg-jf-surface text-white">
        <Providers>
          <div className="sticky top-0 z-50">
            <DevBanner />
            <SiteHeader />
          </div>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
