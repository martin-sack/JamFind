'use client'

import { motion } from 'framer-motion'
import { Search, User, Music, Trophy, Award, BarChart3, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-game-dark/95 backdrop-blur supports-[backdrop-filter]:bg-game-dark/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center neon-glow">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-game-title bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              JamFind
            </span>
            <span className="text-sm font-game-body text-muted-foreground hidden sm:block">
              Play the Music Game
            </span>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <motion.a
            href="/"
            className="text-sm font-game-body transition-colors hover:text-neon-purple px-3 py-2 rounded-lg hover:bg-purple-500/10"
            whileHover={{ scale: 1.05 }}
          >
            Home
          </motion.a>
          <motion.a
            href="/submit"
            className="text-sm font-game-body transition-colors hover:text-neon-green px-3 py-2 rounded-lg hover:bg-green-500/10 flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="h-4 w-4" />
            Submit Your 10
          </motion.a>
          <motion.a
            href="/charts"
            className="text-sm font-game-body transition-colors hover:text-neon-pink px-3 py-2 rounded-lg hover:bg-pink-500/10 flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 className="h-4 w-4" />
            Billboard
          </motion.a>
          <motion.a
            href="/leaderboard"
            className="text-sm font-game-body transition-colors hover:text-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-500/10 flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Award className="h-4 w-4" />
            Leaderboard
          </motion.a>
          <motion.a
            href="/rewards"
            className="text-sm font-game-body transition-colors hover:text-orange-400 px-3 py-2 rounded-lg hover:bg-orange-500/10 flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Gift className="h-4 w-4" />
            Rewards
          </motion.a>
          <motion.a
            href="/discover"
            className="text-sm font-game-body transition-colors hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/10"
            whileHover={{ scale: 1.05 }}
          >
            Stream
          </motion.a>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <motion.div
            className="relative hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search artists, tracks..."
              className="pl-10 w-64 bg-game-card border-neon-purple text-white placeholder:text-muted-foreground"
            />
          </motion.div>

          {/* Points Counter */}
          <motion.div
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-game-card border border-purple-500/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full neon-pulse"></div>
            <span className="text-sm font-game-body text-neon-green">420 XP</span>
          </motion.div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="ghost" size="icon" className="relative bg-game-card border border-purple-500/30 hover:bg-purple-500/10">
              <User className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
