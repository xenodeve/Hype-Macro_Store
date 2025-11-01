import { useCallback, useEffect, useState } from 'react'
import { initializeTheme, onClick as toggleTheme, reflectThemePreference, theme, THEME_CHANGE_EVENT } from '../preview/ThemeToggle'

const combine = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ').trim()

type ThemeToggleButtonProps = {
  className?: string
  id?: string
}

const ThemeToggleButton = ({ className = '', id = 'theme-toggle' }: ThemeToggleButtonProps) => {
  const [currentTheme, setCurrentTheme] = useState(theme.value)

  useEffect(() => {
    initializeTheme()
    reflectThemePreference()
    setCurrentTheme(theme.value)
  }, [])

  const handleToggle = useCallback(() => {
    toggleTheme()
  }, [])

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ value: string }>).detail
      if (!detail) return
      setCurrentTheme(detail.value)
    }
    window.addEventListener(THEME_CHANGE_EVENT, listener as EventListener)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, listener as EventListener)
  }, [])

  return (
    <button
      type="button"
      id={id}
      onClick={handleToggle}
      aria-label={currentTheme}
      aria-live="polite"
      className={combine('theme-toggle liquid-glass-button p-3 rounded-full flex items-center justify-center transform-gpu', className)}
    >
      <svg className="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
        <mask className="moon" id={`${id}-moon-mask`}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle className="sun" cx="12" cy="12" r="6" mask={`url(#${id}-moon-mask)`} fill="currentColor" />
        <g className="sun-beams" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}

export default ThemeToggleButton
