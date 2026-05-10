'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useDevice } from '@/hooks/use-device'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  enabled?: boolean
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  enabled = true,
}: PullToRefreshProps) {
  const { isMobile, touchSupport } = useDevice()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, threshold], [0, 360])
  const opacity = useTransform(y, [0, threshold], [0, 1])

  // Disable on desktop or if touch not supported
  if (!enabled || !isMobile || !touchSupport) {
    return <>{children}</>
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull-to-refresh at the top of the page
    if (window.scrollY === 0 && containerRef.current) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current

    // Only pull down, not up
    if (distance > 0) {
      // Add resistance
      const resistance = distance * 0.4
      const clampedDistance = Math.min(resistance, threshold * 1.5)
      setPullDistance(clampedDistance)

      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) {
      setIsPulling(false)
      return
    }

    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true)
      setPullDistance(threshold)

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        // Animate back
        animate(y, 0, { duration: 0.3 })
        setPullDistance(0)
        setIsRefreshing(false)
      }
    } else {
      // Snap back
      animate(y, 0, { duration: 0.3 })
      setPullDistance(0)
    }

    setIsPulling(false)
    startY.current = 0
  }

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <motion.div
            style={{ rotate }}
            className="text-green-500"
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw className="w-6 h-6" />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">
            {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div
        style={{ y: pullDistance }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
