'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  desktopImageUrl?: string
  mobileImageUrl?: string
}

interface HeroCarouselProps {
  banners: Banner[]
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || banners.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isPaused, banners.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-navy via-navy-deep to-navy flex items-center justify-center overflow-hidden">
        <div className="text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">MORJAL Enterprises</h1>
          <p className="text-xl text-gold">Premium Electrical Safety Products</p>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentIndex]
  const imageUrl = currentBanner.mobileImageUrl || currentBanner.desktopImageUrl

  return (
    <div
      className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Banner Image - Responsive */}
          <div className="absolute inset-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={currentBanner.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-navy via-navy-deep to-navy" />
            )}
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>

          {/* Banner Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl text-white"
              >
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  {currentBanner.title}
                </h1>
                {currentBanner.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-xl mb-8 text-gray-100"
                  >
                    {currentBanner.description}
                  </motion.p>
                )}
                {currentBanner.buttonText && currentBanner.buttonUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Link href={currentBanner.buttonUrl}>
                      <Button
                        size="lg"
                        className="bg-gold hover:bg-gold/90 text-navy font-semibold py-4 px-8 rounded-xl"
                      >
                        {currentBanner.buttonText}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-gold w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
