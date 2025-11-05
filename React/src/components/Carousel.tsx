import { useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import { motion, type PanInfo, type Transition, useMotionValue, useTransform } from 'motion/react'

export interface CarouselItem {
  title: string
  description: string
  id: number
  icon: ReactNode
  videoUrl?: string
}

export interface CarouselProps {
  items?: CarouselItem[]
  baseWidth?: number
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
  loop?: boolean
  round?: boolean
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: 'Text Animations',
    description: 'Cool text animations for your projects.',
    id: 1,
    icon: <span className="text-xs font-semibold text-white">TA</span>
  },
  {
    title: 'Animations',
    description: 'Smooth animations for your projects.',
    id: 2,
    icon: <span className="text-xs font-semibold text-white">AN</span>
  },
  {
    title: 'Components',
    description: 'Reusable components for your projects.',
    id: 3,
    icon: <span className="text-xs font-semibold text-white">UI</span>
  },
  {
    title: 'Backgrounds',
    description: 'Beautiful backgrounds and patterns.',
    id: 4,
    icon: <span className="text-xs font-semibold text-white">BG</span>
  },
  {
    title: 'Common UI',
    description: 'Common UI components are coming soon!',
    id: 5,
    icon: <span className="text-xs font-semibold text-white">UX</span>
  }
]

const DRAG_BUFFER = 0
const VELOCITY_THRESHOLD = 500
const GAP = 16
const SPRING_OPTIONS: Transition = { 
  type: 'spring', 
  stiffness: 400, 
  damping: 40,
  mass: 1,
  restDelta: 0.001,
  restSpeed: 0.001
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}: CarouselProps): JSX.Element {
  const containerPadding = 16
  const [responsiveWidth, setResponsiveWidth] = useState(baseWidth)
  const itemWidth = responsiveWidth - containerPadding * 2
  const trackItemOffset = itemWidth + GAP

  const carouselItems = loop && items.length > 0 ? [...items, items[0]] : items
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Responsive width handling
  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth
      if (screenWidth < 640) {
        // Mobile
        setResponsiveWidth(Math.min(baseWidth, screenWidth - 32))
      } else if (screenWidth < 1024) {
        // Tablet
        setResponsiveWidth(Math.min(baseWidth, screenWidth * 0.85))
      } else {
        // Desktop
        setResponsiveWidth(baseWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [baseWidth])

  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return

    const container = containerRef.current
    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [pauseOnHover])

  useEffect(() => {
    if (!autoplay || (pauseOnHover && isHovered) || carouselItems.length <= 1) return

    const timer = window.setInterval(() => {
      setCurrentIndex(prev => {
        if (loop && prev === items.length - 1) {
          return prev + 1
        }
        if (prev === carouselItems.length - 1) {
          return loop ? 0 : prev
        }
        return prev + 1
      })
    }, autoplayDelay)

    return () => window.clearInterval(timer)
  }, [autoplay, autoplayDelay, carouselItems.length, isHovered, loop, pauseOnHover, items.length])

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS

  const handleAnimationComplete = () => {
    if (!loop || carouselItems.length === 0) return
    if (currentIndex === carouselItems.length - 1) {
      setIsResetting(true)
      x.set(0)
      setCurrentIndex(0)
      window.setTimeout(() => setIsResetting(false), 50)
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1))
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1)
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0))
      }
    }
  }

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-2 sm:p-4 transform-gpu ${
        round ? 'rounded-full border border-white' : 'rounded-[12px] sm:rounded-[24px] border border-[#222]'
      }`}
      style={{
        width: `${responsiveWidth}px`,
        maxWidth: '100%',
        ...(round ? { height: `${responsiveWidth}px` } : {}),
        willChange: 'transform'
      }}
    >
      <motion.div
        className="flex transform-gpu"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
          willChange: 'transform'
        }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset]
          const outputRange = [90, 0, -90]
          const rotateY = useTransform(x, range, outputRange, { clamp: false })

          return (
            <motion.div
              key={`${item.id}-${index}`}
              className={`relative shrink-0 flex flex-col transform-gpu ${
                round
                  ? 'items-center justify-center text-center bg-[#060010] border-0'
                  : 'items-start justify-start bg-gray-100 dark:bg-gray-800 border-0 rounded-[12px]'
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : '100%',
                rotateY,
                ...(round ? { borderRadius: '50%' } : {}),
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              transition={effectiveTransition}
            >
              {item.videoUrl ? (
                <>
                  <div className="aspect-video w-full transform-gpu">
                    <iframe
                      className="w-full h-full"
                      src={item.videoUrl}
                      title={item.title}
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 sm:p-4 w-full">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">{item.description}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={round ? 'p-0 m-0' : 'mb-4 p-5'}>
                    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060010]">
                      {item.icon}
                    </span>
                  </div>
                  <div className="p-5 text-white">
                    <div className="mb-1 font-black text-lg">{item.title}</div>
                    <p className="text-sm text-white/80">{item.description}</p>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </motion.div>
      <div className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}>
        <div className="mt-4 flex w-[150px] justify-between px-8 transform-gpu">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 transform-gpu ${
                currentIndex % items.length === index
                  ? round
                    ? 'bg-white'
                    : 'bg-[#333333]'
                  : round
                    ? 'bg-[#555]'
                    : 'bg-[rgba(51,51,51,0.4)]'
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
              style={{ willChange: 'transform' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
