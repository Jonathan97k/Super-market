'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDevice } from '@/hooks/use-device'

interface SwipeableCarouselProps {
  children: ReactNode
  className?: string
  itemsPerView?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export default function SwipeableProductCarousel({
  children,
  className = '',
  itemsPerView = { mobile: 1.5, tablet: 2.5, desktop: 4 },
  gap = 16,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
}: SwipeableCarouselProps) {
  const { isMobile, isTablet, isDesktop } = useDevice()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)

  // Determine items per view based on device
  const getItemsPerView = () => {
    if (isMobile) return itemsPerView.mobile || 1.5
    if (isTablet) return itemsPerView.tablet || 2.5
    return itemsPerView.desktop || 4
  }

  const itemsInView = getItemsPerView()
  const itemWidth = (containerWidth - gap * (itemsInView - 1)) / itemsInView
  const maxIndex = Math.max(0, totalItems - Math.floor(itemsInView))

  // Calculate container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setContainerWidth(containerRef.current?.offsetWidth || 0)
        setTotalItems(containerRef.current?.children.length || 0)
      }

      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [children])

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isDragging) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, maxIndex, isDragging])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, panInfo: PanInfo) => {
    const dragDistance = panInfo.offset.x
    const threshold = itemWidth * 0.3

    if (dragDistance > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    } else if (dragDistance < -threshold && currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1)
    }

    setIsDragging(false)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const scrollToIndex = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
  }

  const nextSlide = () => {
    scrollToIndex(currentIndex + 1)
  }

  const prevSlide = () => {
    scrollToIndex(currentIndex - 1)
  }

  const xTransform = useTransform(x, [0, containerWidth], [0, -containerWidth])

  return (
    <div className={`relative ${className}`}>
      {/* Carousel container */}
      <div className="relative overflow-hidden" style={{ padding: `${gap / 2}px 0` }}>
        <motion.div
          ref={containerRef}
          className="flex"
          drag="x"
          dragConstraints={{ left: -maxIndex * (itemWidth + gap), right: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            x: -currentIndex * (itemWidth + gap),
            gap: `${gap}px`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Navigation arrows */}
      {showArrows && !isMobile && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Pagination dots (mobile only) */}
      {isMobile && totalItems > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-green-500' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
