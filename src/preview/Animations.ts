export function setupProductCardsAnimation(): void {
  const productCards = document.querySelectorAll('#products .group') as NodeListOf<HTMLElement>

  productCards.forEach((card: HTMLElement, index: number): void => {
    card.style.opacity = '0'
    card.style.transform = 'translateY(20px)'

    setTimeout((): void => {
      card.style.transition = 'all 0.6s ease-out'
      card.style.opacity = '1'
      card.style.transform = 'translateY(0)'
    }, 200 * (index + 1))

    card.addEventListener('mouseenter', (): void => {
      card.style.transform = 'translateY(-10px) scale(1.02)'
    })

    card.addEventListener('mouseleave', (): void => {
      card.style.transform = 'translateY(0) scale(1)'
    })
  })

  const productObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((entry: IntersectionObserverEntry, index: number): void => {
      if (entry.isIntersecting) {
        setTimeout((): void => {
          ;(entry.target as HTMLElement).classList.add('animate-fade-in')
        }, 100 * index)
      }
    })
  }, { threshold: 0.1 })

  productCards.forEach((card: HTMLElement): void => {
    productObserver.observe(card)
  })
}

export function setupHeroAnimations(): void {
  window.addEventListener('load', (): void => {
    setTimeout((): void => {
      const heroTitle = document.getElementById('hero-title') as HTMLElement | null
      if (heroTitle) {
        heroTitle.style.opacity = '1'
        heroTitle.style.transform = 'translateY(0)'
      }
    }, 500)

    setTimeout((): void => {
      const heroSubtitle = document.getElementById('hero-subtitle') as HTMLElement | null
      if (heroSubtitle) {
        heroSubtitle.style.opacity = '1'
        heroSubtitle.style.transform = 'translateY(0)'
      }
    }, 1000)

    setTimeout((): void => {
      const heroCta = document.getElementById('hero-cta') as HTMLElement | null
      if (heroCta) {
        heroCta.style.opacity = '1'
        heroCta.style.transform = 'translateY(0)'
      }
    }, 1500)
  })
}

export function setupFeatureAnimations(): void {
  const observerOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
    entries.forEach((entry: IntersectionObserverEntry): void => {
      if (entry.isIntersecting) {
        ;(entry.target as HTMLElement).classList.add('animate-fade-in')
      }
    })
  }, observerOptions)

  document.querySelectorAll('#features > div > div').forEach((el: Element): void => {
    observer.observe(el)
  })
}
