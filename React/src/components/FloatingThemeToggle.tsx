import ThemeToggleButton from './ThemeToggleButton'

const FloatingThemeToggle = () => {
  return (
    <div className="sticky top-4 md:top-6 z-[98] flex justify-end px-4 md:px-6 pointer-events-none">
      <div className="pointer-events-auto bg-[var(--card-nav-bg)] backdrop-blur-md rounded-full shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-1 transition-colors duration-300">
        <ThemeToggleButton id="theme-toggle-floating" />
      </div>
    </div>
  )
}

export default FloatingThemeToggle
