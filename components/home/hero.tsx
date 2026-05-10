'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, Tag, Star, Truck } from 'lucide-react'
import PromoSlider from './promo-slider'
import HeroSearch from './hero-search'

interface Slide {
  id: number
  headline: string
  subtext: string
  ctas: Array<{ text: string; variant: 'primary' | 'secondary'; href: string }>
  backgroundImage?: string
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slides: Slide[] = [
    {
      id: 1,
      headline: "Fresh Groceries Delivered Faster",
      subtext: "Premium quality essentials for your everyday home.",
      ctas: [
        { text: "Shop Now", variant: "primary", href: "/products" },
        { text: "Explore Deals", variant: "secondary", href: "/offers" }
      ]
    },
    {
      id: 2,
      headline: "Weekly Family Savings",
      subtext: "Middle-class friendly prices without sacrificing quality.",
      ctas: [
        { text: "View Offers", variant: "primary", href: "/offers" }
      ]
    },
    {
      id: 3,
      headline: "Everything Your Home Needs",
      subtext: "Smart shopping made simple.",
      ctas: [
        { text: "Browse Products", variant: "primary", href: "/products" }
      ]
    }
  ]

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Fresh Daily Stock",
      description: "Quality guaranteed every day"
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: "Affordable Prices",
      description: "Best value for your money"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Fast WhatsApp Ordering",
      description: "Quick and convenient"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Trusted Quality",
      description: "Premium products always"
    }
  ]

  const promoBadges = [
    { text: "Up to 30% Off", color: "bg-red-500" },
    { text: "New Arrivals", color: "bg-blue-500" },
    { text: "Hot Deals", color: "bg-orange-500" }
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
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10 seconds
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        {/* Background image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#1a2f4a] to-[#0B1F3A]" />
        
        {/* Subtle product showcase imagery placeholders */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-1/3 right-20 w-48 h-48 bg-[#16A34A]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-2000" />
          <div className="absolute bottom-1/3 right-1/3 w-36 h-36 bg-[#16A34A]/10 rounded-full blur-2xl animate-pulse delay-3000" />
        </div>

        {/* Floating glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#16A34A]/20 to-transparent animate-pulse" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-white/20 to-transparent animate-pulse delay-500" />
        </div>
      </div>

      {/* Floating Promotion Badges */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        {promoBadges.map((badge, index) => (
          <motion.div
            key={badge.text}
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -5, 0]
            }}
            transition={{ 
              delay: index * 0.2, 
              duration: 0.5,
              y: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.3
              }
            }}
            className={`${badge.color} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm`}
          >
            {badge.text}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content - Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
            >
              <AnimatePresence mode="wait">
                <div key={currentSlide} className="space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-4xl md:text-6xl font-bold text-white leading-tight"
                  >
                    {slides[currentSlide].headline}
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg md:text-xl text-white/90 leading-relaxed"
                  >
                    {slides[currentSlide].subtext}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {slides[currentSlide].ctas.map((cta, index) => (
                      <motion.button
                        key={cta.text}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                          cta.variant === 'primary'
                            ? 'bg-[#16A34A] text-white shadow-lg hover:shadow-xl hover:bg-[#158a3d]'
                            : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                        }`}
                      >
                        {cta.text}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index
                          ? 'bg-white w-8'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Search */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:block"
            >
              <HeroSearch />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="flex items-center space-x-3 text-white"
              >
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-white/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Hero Search */}
      <div className="lg:hidden absolute bottom-20 left-4 right-4">
        <HeroSearch />
      </div>
    </section>
  )
}
