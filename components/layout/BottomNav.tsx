'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Plus, BarChart3, User } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/submit', label: 'Submit', icon: Plus, isCenter: true },
  { href: '/charts', label: 'Charts', icon: BarChart3 },
  { href: '/account', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="flex items-end justify-around"
        style={{
          height: '56px',
          backgroundColor: '#0D0D0D',
          borderTop: '1px solid #1A1A1A',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)
          const Icon = tab.icon

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center"
                style={{ minWidth: '48px', minHeight: '48px' }}
              >
                <div
                  className="flex items-center justify-center rounded-full -mt-5 shadow-lg"
                  style={{
                    width: '52px',
                    height: '52px',
                    backgroundColor: '#F4A500',
                  }}
                >
                  <Icon className="h-6 w-6 text-black" strokeWidth={2.5} />
                </div>
                <span
                  className="text-[10px] mt-0.5"
                  style={{ color: isActive ? '#F4A500' : '#6B7280' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: isActive ? '#F4A500' : '#6B7280' }}
              />
              <span
                className="text-[10px] mt-1"
                style={{ color: isActive ? '#F4A500' : '#6B7280' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
