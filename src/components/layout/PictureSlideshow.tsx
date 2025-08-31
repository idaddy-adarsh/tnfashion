"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const slideImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    alt: "Fashion Collection 1",
    title: "Premium Fashion",
    subtitle: "Discover our exclusive collection"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    alt: "Fashion Collection 2",
    title: "Modern Style",
    subtitle: "Where comfort meets elegance"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    alt: "Fashion Collection 3",
    title: "Trendy Designs",
    subtitle: "Stay ahead with our latest trends"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    alt: "Fashion Collection 4",
    title: "Sustainable Fashion",
    subtitle: "Eco-friendly and stylish choices"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    alt: "Fashion Collection 5",
    title: "Urban Collection",
    subtitle: "Perfect for city life"
  }
]

export default function PictureSlideshow() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        className="w-full h-full"
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          loop={true}
          className="w-full h-full"
        >
          {slideImages.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full">
              {/* Background Image */}
              <div className="relative w-full h-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
                
                {/* Content Overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <div className="text-center text-white max-w-4xl mx-auto px-4">
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 tracking-tight"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-custom absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer group">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:text-white/90" />
          </motion.div>
        </div>

        <div className="swiper-button-next-custom absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer group">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:text-white/90" />
          </motion.div>
        </div>

        {/* Custom Pagination */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slideImages.map((_, index) => (
            <div
              key={index}
              className="swiper-pagination-bullet-custom w-3 h-3 rounded-full bg-white/40 cursor-pointer transition-all duration-300 hover:bg-white/60"
              data-index={index}
            />
          ))}
        </div>
      </motion.div>

      <style jsx global>{`
        .swiper-pagination-bullet-active-custom {
          background-color: rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.2);
        }
        
        .swiper-pagination-bullet-custom:hover {
          transform: scale(1.1);
        }
        
        .swiper-slide-active .motion-div {
          animation: slideIn 0.8s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Hide default swiper navigation and pagination */
        .swiper-button-next,
        .swiper-button-prev,
        .swiper-pagination {
          display: none !important;
        }
      `}</style>
    </section>
  )
}
