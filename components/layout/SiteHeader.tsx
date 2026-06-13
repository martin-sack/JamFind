'use client'

import Link from 'next/link'
import { Music, Ear, Compass, BarChart3 } from 'lucide-react'
import { ProfileMenu } from './ProfileMenu'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(13,13,13,0.95)' }}>
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F4A500' }}>
            <Music className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-bold text-white">JamFind</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/find" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Ear className="h-4 w-4" /> Find
          </Link>
          <Link href="/discover" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Compass className="h-4 w-4" /> Discover
          </Link>
          <Link href="/charts" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <BarChart3 className="h-4 w-4" /> Charts
          </Link>
          <Link href="/submit" className="ml-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#F4A500', color: '#000' }}>
            Submit Your 10
          </Link>
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
