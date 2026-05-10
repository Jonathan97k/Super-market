'use client'

import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isEdge: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  touchSupport: boolean
  prefersReducedMotion: boolean
  connection: {
    effectiveType: string
    downlink: number
    rtt: number
    saveData: boolean
  } | null
}

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isEdge: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    touchSupport: false,
    prefersReducedMotion: false,
    connection: null,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const ua = navigator.userAgent
      const width = window.innerWidth
      const height = window.innerHeight

      // Device type detection
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // OS detection
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isAndroid = /Android/.test(ua)

      // Browser detection
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
      const isChrome = /Chrome/.test(ua) && !/Edge|OPR/.test(ua)
      const isFirefox = /Firefox/.test(ua)
      const isEdge = /Edge/.test(ua) || /Edg/.test(ua)

      // Connection info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        isEdge,
        screenWidth: width,
        screenHeight: height,
        pixelRatio: window.devicePixelRatio || 1,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        connection: connection ? {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        } : null,
      })
    }

    updateDeviceInfo()

    const handleResize = () => updateDeviceInfo()
    window.addEventListener('resize', handleResize)

    // Listen for connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateDeviceInfo)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (connection) {
        connection.removeEventListener('change', updateDeviceInfo)
      }
    }
  }, [])

  return deviceInfo
}
