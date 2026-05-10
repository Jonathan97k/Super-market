'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface TouchGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
  isSwipe: boolean
}

export interface UseTouchOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  longPressDelay?: number
}

export function useTouch(options: UseTouchOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options

  const [gesture, setGesture] = useState<TouchGesture>({
    direction: null,
    distance: 0,
    velocity: 0,
    isSwipe: false,
  })

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasMovedRef = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    hasMovedRef.current = false

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (!hasMovedRef.current) {
          onLongPress()
        }
      }, longPressDelay)
    }
  }, [onLongPress, longPressDelay])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Cancel long press if moved significantly
    if (distance > 10) {
      hasMovedRef.current = true
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime

    let direction: TouchGesture['direction'] = null
    let isSwipe = false

    if (distance > swipeThreshold) {
      isSwipe = true
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }

    setGesture({
      direction,
      distance,
      velocity,
      isSwipe,
    })

    // Trigger callbacks
    if (isSwipe) {
      switch (direction) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }
    } else if (!hasMovedRef.current && onTap && deltaTime < 300) {
      onTap()
    }

    touchStartRef.current = null
  }, [swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap])

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

  return { gesture, touchHandlers }
}

export function useSwipeable(options: UseTouchOptions = {}) {
  const { gesture, touchHandlers } = useTouch(options)
  return { gesture, touchHandlers }
}
