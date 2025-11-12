'use client'

import { motion } from 'framer-motion'

interface BadgeProps {
  icon: string
  title: string
  description: string
  earned?: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  className?: string
}

export function Badge({ 
  icon, 
  title, 
  description, 
  earned = true,
  rarity = 'common',
  className = '' 
}: BadgeProps) {
  const rarityConfig = {
    common: {
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20',
      text: 'text-purple-400'
    },
    rare: {
      border: 'border-blue-500/40',
      glow: 'shadow-blue-500/30',
      text: 'text-blue-400'
    },
    epic: {
      border: 'border-pink-500/50',
      glow: 'shadow-pink-500/40',
      text: 'text-pink-400'
    },
    legendary: {
      border: 'border-yellow-500/60',
      glow: 'shadow-yellow-500/50',
      text: 'text-yellow-400'
    }
  }

  const config = rarityConfig[rarity]

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl bg-game-card border backdrop-blur-sm
        ${earned ? `${config.border} ${config.glow}` : 'border-muted-foreground/20 opacity-50'}
        transition-all duration-300 hover:scale-105 cursor-pointer
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Badge Icon */}
      <div className="text-center mb-3">
        <div className={`
          text-4xl mb-2 transition-all duration-300
          ${earned ? 'neon-pulse' : 'grayscale'}
        `}>
          {icon}
        </div>
        
        {/* Rarity Indicator */}
        <div className={`
          text-xs font-game-body px-2 py-1 rounded-full border
          ${earned ? `${config.border} ${config.text}` : 'border-muted-foreground/20 text-muted-foreground'}
        `}>
          {rarity.toUpperCase()}
        </div>
      </div>

      {/* Badge Content */}
      <div className="text-center">
        <h3 className={`
          font-game-heading text-sm mb-1
          ${earned ? 'text-white' : 'text-muted-foreground'}
        `}>
          {title}
        </h3>
        <p className={`
          text-xs font-game-body
          ${earned ? 'text-muted-foreground' : 'text-muted-foreground/60'}
        `}>
          {description}
        </p>
      </div>

      {/* Earned Status */}
      {!earned && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-xs font-game-body text-muted-foreground">Locked</div>
          </div>
        </div>
      )}

      {/* Glow Effect */}
      {earned && (
        <div className={`
          absolute inset-0 rounded-xl opacity-20 blur-sm
          ${config.glow.replace('shadow', 'bg')}
          -z-10
        `}></div>
      )}
    </motion.div>
  )
}
