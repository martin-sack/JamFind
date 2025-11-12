'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endDate: Date
  className?: string
}

export function CountdownTimer({ endDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  const formatTime = (time: number) => time.toString().padStart(2, '0')

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="text-center">
        <div className="bg-game-card rounded-lg p-3 min-w-16 border border-purple-500/30">
          <div className="text-2xl font-game-title text-neon-purple">
            {formatTime(timeLeft.days)}
          </div>
          <div className="text-xs font-game-body text-muted-foreground mt-1">DAYS</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-game-card rounded-lg p-3 min-w-16 border border-purple-500/30">
          <div className="text-2xl font-game-title text-neon-green">
            {formatTime(timeLeft.hours)}
          </div>
          <div className="text-xs font-game-body text-muted-foreground mt-1">HOURS</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-game-card rounded-lg p-3 min-w-16 border border-purple-500/30">
          <div className="text-2xl font-game-title text-neon-pink">
            {formatTime(timeLeft.minutes)}
          </div>
          <div className="text-xs font-game-body text-muted-foreground mt-1">MIN</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-game-card rounded-lg p-3 min-w-16 border border-purple-500/30">
          <div className="text-2xl font-game-title text-yellow-400">
            {formatTime(timeLeft.seconds)}
          </div>
          <div className="text-xs font-game-body text-muted-foreground mt-1">SEC</div>
        </div>
      </div>
    </div>
  )
}
