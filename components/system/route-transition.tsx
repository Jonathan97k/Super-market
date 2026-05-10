'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RouteTransitionProps {
  children: React.ReactNode
  isChanging?: boolean
}

export default function RouteTransition({ children, isChanging }: RouteTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isChanging !== undefined) {
      setIsVisible(!isChanging)
    }
  }, [isChanging])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}

export function FadeTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function SlideTransition({ 
  children, 
  direction = 'left' 
}: { 
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
}) {
  const slideVariants = {
    left: { x: [-20, 0] },
    right: { x: [20, 0] },
    up: { y: [-20, 0] },
    down: { y: [20, 0] }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...slideVariants[direction][0] }}
      animate={{ opacity: 1, ...slideVariants[direction][1] }}
      exit={{ opacity: 0, ...slideVariants[direction][0] }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
