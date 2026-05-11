'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, Tag, Star, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import HeroSearch from './hero-search'

interface Slide {
  id: number
  headline: string
  subtext: string
  ctas: Array<{ text: string; variant: 'primary' | 'secondary'; href: string }>
}

const FLOATING_IMAGES = [
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=70', // bananas
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=70', // apples
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=70', // tomatoes
  'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=70', // avocado
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=70',   // milk
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=70', // bread
  'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=70', // beverages
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=70', // meat
]

const FLOAT_POSITIONS = [
  { top: '8%', left: '6%', size: 90, delay: 0 },
  { top: '18%', left: '78%', size: 110, delay: 0.4 },
  { top: '55%', left: '4%', size: 80, delay: 0.8 },
  { top: '62%', left: '85%', size: 100, delay: 1.2 },
  { top: '35%', left: '40%', size: 70, delay: 1.6 },
  { top: '78%', left: '50%', size: 85, delay: 2.0 },
  { top: '12%', left: '45%', size: 75, delay: 2.4 },
  { top: '70%', left: '22%', size: 95, delay: 2.8 },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slides: Slide[] = [
    {
      id: 1,
      headline: 'Fresh Groceries, Delivered',
      subtext: 'Premium quality essentials for your everyday home.',
      ctas: [
        { text: 'Shop Now', variant: 'primary', href: '/products' },
        { text: 'View Deals', variant: 'secondary', href: '/offers' },
      ],
    },
    {
      id: 2,
      headline: 'Weekly Family Savings',
      subtext: 'Best prices in town without compromising quality.',
      ctas: [{ text: 'See Offers', variant: 'primary', href: '/offers' }],
    },
    {
      id: 3,
      headline: 'Everything Your Home Needs',
      subtext: 'Smart shopping made simple.',
      ctas: [{ text: 'Browse Products', variant: 'primary', href: '/products' }],
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length)
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length)

  return (
    <section className="relative w-full min-h-[420px] md:min-h-[480px] overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#13315c] to-[#0B1F3A]">
      {/* Animated floating product images */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOAT_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full overflow-hidden shadow-2xl ring-2 ring-white/20"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.size,
              height: pos.size,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0.55, 0.55, 0],
              scale: [0.6, 1, 1, 0.6],
              y: [0, -25, 0, -15, 0],
              x: [0, 12, -8, 6, 0],
            }}
            transition={{
              duration: 9,
              delay: pos.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image
              src={FLOATING_IMAGES[i % FLOATING_IMAGES.length]}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
              priority={i < 2}
            />
          </motion.div>
        ))}

        {/* Subtle glow accents */}
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-[#16A34A]/15 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-white/10 blur-3xl rounded-full" />
      </div>

      {/* Dark vignette so text is readable over images */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A]/85 via-[#0B1F3A]/55 to-[#0B1F3A]/85" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-14">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-6 flex justify-center">
          <div className="relative h-14 w-48 bg-white rounded-lg overflow-hidden shadow-md">
            <Image
              src="/logo.png"
              alt="Jacke Mabvuka Supermarket"
              fill
              sizes="192px"
              className="object-contain p-1.5"
              priority
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Compact glass card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-7 shadow-xl border border-white/15 max-w-xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-3 md:space-y-4"
              >
                <span className="inline-block bg-[#16A34A]/30 text-[#a7f3c8] text-[11px] md:text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  Welcome
                </span>
                <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                  {slides[currentSlide].headline}
                </h1>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  {slides[currentSlide].subtext}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3 pt-1">
                  {slides[currentSlide].ctas.map((cta) => (
                    <Link
                      key={cta.text}
                      href={cta.href}
                      className={`px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all ${
                        cta.variant === 'primary'
                          ? 'bg-[#16A34A] text-white shadow-lg hover:bg-[#13863e]'
                          : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                      }`}
                    >
                      {cta.text}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider dots / arrows */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === index ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="p-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search panel (desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden lg:block"
          >
            <HeroSearch />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
