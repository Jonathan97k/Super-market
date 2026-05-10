'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PromoSlide {
  id: number
  headline: string
  sub: string
  ctas: string[]
}

export default function PromoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides: PromoSlide[] = [
    {
      id: 1,
      headline: "Fresh Groceries Delivered Faster",
      sub: "Premium quality essentials for your everyday home.",
      ctas: ["Shop Now", "Explore Deals"]
    },
    {
      id: 2,
      headline: "Weekly Family Savings",
      sub: "Middle-class friendly prices without sacrificing quality.",
      ctas: ["View Offers"]
    },
    {
      id: 3,
      headline: "Everything Your Home Needs",
      sub: "Smart shopping made simple.",
      ctas: ["Browse Products"]
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: currentSlide === index ? 1 : 0,
            x: currentSlide === index ? 0 : (index < currentSlide ? -100 : 100),
            zIndex: currentSlide === index ? 10 : 0
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={currentSlide === index ? "visible" : "hidden"}
            className="text-center max-w-4xl mx-auto px-6"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {slide.headline}
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              {slide.sub}
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {slide.ctas.map((cta, ctaIndex) => (
                <motion.button
                  key={ctaIndex}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                    ctaIndex === 0 
                      ? 'bg-[#16A34A] text-white hover:bg-green-600 hover:shadow-green-500/25' 
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {cta}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-white w-8'
                : 'bg-white/40 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
