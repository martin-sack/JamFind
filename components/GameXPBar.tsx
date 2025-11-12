'use client'

interface GameXPBarProps {
  progress: number // 0-100
  currentXP?: number
  nextLevelXP?: number
  level?: number
  className?: string
}

export function GameXPBar({ 
  progress, 
  currentXP = 0, 
  nextLevelXP = 100, 
  level = 1,
  className = '' 
}: GameXPBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Level and XP Info */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="font-game-heading text-neon-purple">Level {level}</span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <span className="font-game-body text-muted-foreground">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
        <span className="font-game-body text-neon-green">
          {clampedProgress}%
        </span>
      </div>

      {/* XP Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="w-full h-3 bg-game-card rounded-full border border-purple-500/20 overflow-hidden">
          {/* Progress Fill */}
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out xp-bar"
            style={{ 
              '--progress': `${clampedProgress}%`,
              width: `${clampedProgress}%`
            } as React.CSSProperties}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-sm"></div>
          </div>
        </div>

        {/* Progress Markers */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {[0, 25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className={`w-1 h-1 rounded-full ${
                clampedProgress >= marker ? 'bg-white' : 'bg-muted-foreground/30'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Next Level Info */}
      {nextLevelXP > 0 && (
        <div className="text-xs font-game-body text-muted-foreground text-center">
          {nextLevelXP - currentXP} XP to Level {level + 1}
        </div>
      )}
    </div>
  )
}
