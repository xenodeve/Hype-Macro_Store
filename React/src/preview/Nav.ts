export function setupMobileMenu(): void {
  const mobileMenuButton = document.getElementById('mobile-menu-button') as HTMLElement | null
  const mobileMenu = document.getElementById('mobile-menu') as HTMLElement | null

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', (): void => {
      mobileMenu.classList.toggle('hidden')
    })
  }
}

export function setupSmoothNavigation(): void {
  const navLinks = document.querySelectorAll('a[href*="#"]') as NodeListOf<HTMLAnchorElement>

  navLinks.forEach((link) => {
    link.addEventListener('click', (event: Event): void => {
      const href = link.getAttribute('href')
      if (!href) return

      let targetHash = ''
      let targetPath = ''

      if (href.startsWith('#')) {
        targetHash = href.slice(1)
      } else {
        const hashIndex = href.indexOf('#')
        if (hashIndex === -1) return
        targetHash = href.slice(hashIndex + 1)
        targetPath = href.slice(0, hashIndex)
      }

      if (!targetHash) return

      // Allow default navigation when the link points to a different route
      if (targetPath && targetPath !== window.location.pathname) {
        return
      }

      const section = document.getElementById(targetHash)
      if (!section) return

      event.preventDefault()
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })

      const newHash = `#${targetHash}`
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash)
      }
    })
  })
}
