import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { gsap } from 'gsap'

type CardNavLink = {
  label: string
  href?: string
  to?: string
  ariaLabel?: string
}

export type CardNavItem = {
  label: string
  bgColor: string
  textColor: string
  lightBgColor?: string
  lightTextColor?: string
  links: CardNavLink[]
}

export interface CardNavProps {
  logo: ReactNode
  items: CardNavItem[]
  className?: string
  ease?: string
  baseColor?: string
  menuColor?: string
  actions?: (options: { isMobile?: boolean; closeMenu: () => void }) => ReactNode
}

const DEFAULT_HEIGHT = 260

const CardNav = ({
  logo,
  items,
  className = 'sticky top-4 md:top-6 z-[99] flex justify-center px-4 md:px-6',
  ease = 'power3.out',
  baseColor = 'var(--card-nav-bg)',
  menuColor = 'var(--card-nav-menu-color)',
  actions,
}: CardNavProps) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const safeItems = useMemo(() => items.slice(0, 3), [items])

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current
    if (!navEl) return DEFAULT_HEIGHT

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement | null
      if (contentEl) {
        const prevVisibility = contentEl.style.visibility
        const prevPointerEvents = contentEl.style.pointerEvents
        const prevPosition = contentEl.style.position
        const prevHeight = contentEl.style.height

        contentEl.style.visibility = 'visible'
        contentEl.style.pointerEvents = 'auto'
        contentEl.style.position = 'static'
        contentEl.style.height = 'auto'

        const topBar = 60
        const padding = 20
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = prevVisibility
        contentEl.style.pointerEvents = prevPointerEvents
        contentEl.style.position = prevPosition
        contentEl.style.height = prevHeight

        return topBar + contentHeight + padding
      }
    }

    return DEFAULT_HEIGHT
  }, [])

  const createTimeline = useCallback(() => {
    const navEl = navRef.current
    if (!navEl) return null

  gsap.set(navEl, { height: 60, overflow: 'visible' })
    gsap.set(cardsRef.current, { y: 40, opacity: 0 })

    const timeline = gsap.timeline({ paused: true })

    timeline.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    })

    timeline.to(
      cardsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease,
        stagger: 0.08,
      },
      '-=0.1',
    )

    return timeline
  }, [calculateHeight, ease])

  useLayoutEffect(() => {
    const timeline = createTimeline()
    tlRef.current = timeline

    return () => {
      timeline?.kill()
      tlRef.current = null
    }
  }, [createTimeline])

  useLayoutEffect(() => {
    const handleResize = () => {
      const timeline = tlRef.current
      if (!timeline) return

      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })
        timeline.kill()
        const newTimeline = createTimeline()
        if (newTimeline) {
          newTimeline.progress(1)
          tlRef.current = newTimeline
        }
      } else {
        timeline.kill()
        const newTimeline = createTimeline()
        if (newTimeline) tlRef.current = newTimeline
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateHeight, createTimeline, isExpanded])

  const closeMenu = useCallback(() => {
    const timeline = tlRef.current
    if (!timeline || !isExpanded) return

    setIsHamburgerOpen(false)
    timeline.eventCallback('onReverseComplete', () => setIsExpanded(false))
    timeline.reverse()
  }, [isExpanded])

  const toggleMenu = useCallback(() => {
    const timeline = tlRef.current
    if (!timeline) return

    if (!isExpanded) {
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      timeline.play(0)
    } else {
      closeMenu()
    }
  }, [closeMenu, isExpanded])

  const handleLinkClick = useCallback(() => {
    if (!isExpanded) return
    if (window.matchMedia('(max-width: 768px)').matches) {
      closeMenu()
    }
  }, [closeMenu, isExpanded])

  const setCardRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[index] = el
  }, [])

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''} block h-[60px] w-full max-w-[1100px] p-0 rounded-2xl shadow-lg absolute overflow-visible will-change-[height] transition-colors`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between gap-2 p-2 pl-4 pr-4 md:pl-6 md:pr-6 z-[2]">
          <button
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none text-current`}
            onClick={toggleMenu}
            aria-label={isExpanded ? 'ปิดเมนู' : 'เปิดเมนู'}
            style={{ color: menuColor }}
          >
            <span
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''
              } group-hover:opacity-75`}
            />
            <span
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''
              } group-hover:opacity-75`}
            />
          </button>

          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            {logo}
          </div>

          {actions ? (
            <div className="hidden md:flex items-center gap-3 order-3 md:order-none">
              {actions({ isMobile: false, closeMenu })}
            </div>
          ) : null}
        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-3 flex flex-col items-stretch gap-3 justify-start z-[1] ${
            isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          } md:flex-row md:items-end md:gap-4`}
          aria-hidden={!isExpanded}
        >
          {safeItems.map((item, index) => {
            const cardVars = {
              '--card-nav-bg-light': item.lightBgColor ?? item.bgColor,
              '--card-nav-bg-dark': item.bgColor,
              '--card-nav-text-light': item.lightTextColor ?? item.textColor,
              '--card-nav-text-dark': item.textColor,
            } as CSSProperties

            return (
              <div
                key={`${item.label}-${index}`}
                className="nav-card select-none relative flex flex-col gap-3 p-4 rounded-2xl min-w-0 flex-1 min-h-[60px] md:min-h-0 bg-[var(--card-nav-bg-light)] text-[color:var(--card-nav-text-light)] dark:bg-[var(--card-nav-bg-dark)] dark:text-[color:var(--card-nav-text-dark)]"
                ref={setCardRef(index)}
                style={cardVars}
              >
              <div className="nav-card-label font-semibold tracking-tight text-lg md:text-2xl">
                {item.label}
              </div>
              <div className="nav-card-links mt-auto flex flex-col gap-1 text-sm md:text-base">
                {item.links?.map((link, linkIndex) => {
                  const content = (
                    <>
                      <i className="ri-arrow-up-right-line text-base" aria-hidden="true" />
                      {link.label}
                    </>
                  )

                  const commonProps = {
                    className:
                      'nav-card-link inline-flex items-center gap-2 no-underline cursor-pointer transition-opacity duration-300 hover:opacity-80 text-[inherit]',
                    'aria-label': link.ariaLabel ?? link.label,
                    onClick: handleLinkClick,
                  } as const

                  return link.to ? (
                    <RouterLink key={`${link.label}-${linkIndex}`} to={link.to} {...commonProps}>
                      {content}
                    </RouterLink>
                  ) : (
                    <a key={`${link.label}-${linkIndex}`} href={link.href ?? '#'} {...commonProps}>
                      {content}
                    </a>
                  )
                })}
              </div>
              </div>
            )
          })}

          {actions ? (
            <div className="md:hidden flex items-center justify-between gap-3 mt-1 text-sm">
              <div className="flex-1 flex flex-wrap gap-2 text-xs text-gray-700 dark:text-gray-300">
                {actions({ isMobile: true, closeMenu })}
              </div>
              <button
                type="button"
                onClick={toggleMenu}
                className="rounded-xl border border-white/40 bg-white/10 px-3 py-2 text-white backdrop-blur-md"
              >
                ปิดเมนู
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </div>
  )
}

export default CardNav
