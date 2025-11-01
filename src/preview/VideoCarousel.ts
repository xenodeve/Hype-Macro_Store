import type { YouTubeMessageData } from './types'

class VideoCarousel {
  private currentVideo: number = 0
  private readonly maxVideos: number = 4
  private autoPlayInterval: number | undefined
  private timelineInterval: number | undefined
  private isUserInteracting: boolean = false
  private autoPlayPermanentlyStopped: boolean = false
  private timelineStartTime: number = 0
  private readonly autoPlayDuration: number = 10000

  private readonly carouselItems: NodeListOf<HTMLElement>
  private readonly indicators: NodeListOf<HTMLElement>
  private readonly prevBtn: HTMLElement | null
  private readonly nextBtn: HTMLElement | null
  private readonly timelineProgress: HTMLElement | null
  private readonly timelineContainer: HTMLElement | null

  constructor() {
    this.carouselItems = document.querySelectorAll('.carousel-item')
    this.indicators = document.querySelectorAll('.carousel-indicator')
    this.prevBtn = document.querySelector('.carousel-control-prev')
    this.nextBtn = document.querySelector('.carousel-control-next')
    this.timelineProgress = document.querySelector('.timeline-progress')
    this.timelineContainer = document.querySelector('.auto-play-timeline')

    this.init()
  }

  private init(): void {
    this.setupBootstrapCarousel()
    this.setupManualControls()
    this.setupVideoInteraction()
    this.setupYouTubeAPI()
    this.startAutoPlay()
  }

  private setupBootstrapCarousel(): void {
    this.updateCarouselDisplay()
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index))
    })
  }

  private updateCarouselDisplay(): void {
    this.carouselItems.forEach((item, index) => {
      if (index === this.currentVideo) {
        item.classList.add('active')
        item.style.display = 'block'
      } else {
        item.classList.remove('active')
        item.style.display = 'none'
      }
    })

    this.indicators.forEach((indicator, index) => {
      if (index === this.currentVideo) {
        indicator.classList.add('active')
        indicator.classList.remove('bg-gray-300', 'dark:bg-gray-500')
        indicator.classList.add('bg-blue-500')
      } else {
        indicator.classList.remove('active', 'bg-blue-500')
        indicator.classList.add('bg-gray-300', 'dark:bg-gray-500')
      }
    })
  }

  private goToSlide(slideIndex: number): void {
    if (slideIndex >= 0 && slideIndex < this.maxVideos) {
      this.currentVideo = slideIndex
      this.updateCarouselDisplay()
      this.stopAutoPlay()
      this.resetTimeline()
      setTimeout(() => this.startAutoPlay(), 1800000)
    }
  }

  private startAutoPlay(): void {
    if (this.autoPlayPermanentlyStopped) return
    this.resetTimeline()
    this.startTimeline()
    this.autoPlayInterval = window.setInterval(() => {
      if (!this.isUserInteracting && !this.autoPlayPermanentlyStopped) {
        this.nextSlide()
        this.resetTimeline()
        this.startTimeline()
      }
    }, this.autoPlayDuration)
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
      this.autoPlayInterval = undefined
    }
    this.stopTimeline()
  }

  private permanentlyStopAutoPlay(): void {
    this.autoPlayPermanentlyStopped = true
    this.stopAutoPlay()
    this.hideTimeline()
  }

  private startTimeline(): void {
    if (!this.timelineProgress || this.autoPlayPermanentlyStopped) return
    this.timelineStartTime = Date.now()
    this.timelineProgress.style.width = '0%'
    this.timelineProgress.classList.remove('paused')

    this.timelineInterval = window.setInterval(() => {
      if (!this.isUserInteracting && !this.autoPlayPermanentlyStopped) {
        const elapsed = Date.now() - this.timelineStartTime
        const progress = Math.min((elapsed / this.autoPlayDuration) * 100, 100)
        if (this.timelineProgress) this.timelineProgress.style.width = `${progress}%`
        if (progress >= 100) this.stopTimeline()
      }
    }, 50)
  }

  private stopTimeline(): void {
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval)
      this.timelineInterval = undefined
    }
    if (this.timelineProgress) this.timelineProgress.classList.add('paused')
  }

  private resetTimeline(): void {
    if (this.timelineProgress) {
      this.timelineProgress.style.width = '0%'
      this.timelineProgress.classList.remove('paused')
    }
  }

  private hideTimeline(): void {
    if (this.timelineContainer) this.timelineContainer.classList.add('stopped')
  }

  private nextSlide(): void {
    this.currentVideo = (this.currentVideo + 1) % this.maxVideos
    this.updateCarouselDisplay()
  }

  private prevSlide(): void {
    this.currentVideo = this.currentVideo === 0 ? this.maxVideos - 1 : this.currentVideo - 1
    this.updateCarouselDisplay()
  }

  private setupManualControls(): void {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault()
        this.prevSlide()
        this.stopAutoPlay()
        this.resetTimeline()
        setTimeout(() => this.startAutoPlay(), 1800000)
      })
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault()
        this.nextSlide()
        this.stopAutoPlay()
        this.resetTimeline()
        setTimeout(() => this.startAutoPlay(), 1800000)
      })
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide()
        this.stopAutoPlay()
        this.resetTimeline()
        setTimeout(() => this.startAutoPlay(), 1800000)
      } else if (e.key === 'ArrowRight') {
        this.nextSlide()
        this.stopAutoPlay()
        this.resetTimeline()
        setTimeout(() => this.startAutoPlay(), 1800000)
      }
    })
  }

  private setupVideoInteraction(): void {
    const videoContainers = document.querySelectorAll('.carousel-item .video-item') as NodeListOf<HTMLElement>
    videoContainers.forEach((container) => {
      container.addEventListener('mouseenter', () => {
        this.isUserInteracting = true
        this.stopTimeline()
      })
      container.addEventListener('mouseleave', () => {
        setTimeout(() => {
          this.isUserInteracting = false
          if (!this.autoPlayPermanentlyStopped) {
            this.resetTimeline()
            this.startTimeline()
          }
        }, 2000)
      })
      container.addEventListener('click', () => this.permanentlyStopAutoPlay())
    })

    if (this.timelineContainer) {
      this.timelineContainer.addEventListener('mouseenter', () => {
        this.isUserInteracting = true
        this.stopTimeline()
      })
      this.timelineContainer.addEventListener('mouseleave', () => {
        setTimeout(() => {
          this.isUserInteracting = false
          if (!this.autoPlayPermanentlyStopped) {
            this.resetTimeline()
            this.startTimeline()
          }
        }, 1000)
      })
    }
  }

  private setupYouTubeAPI(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data: YouTubeMessageData = JSON.parse(event.data)
        if (data.event === 'video-progress' || data.event === 'onStateChange') {
          if (data.info && data.info.playerState !== undefined) {
            const playerState: number = data.info.playerState
            if (playerState === 1) {
              this.permanentlyStopAutoPlay()
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })

    const iframes = document.querySelectorAll('.carousel-item iframe') as NodeListOf<HTMLIFrameElement>
    iframes.forEach((iframe) => {
      const src = iframe.src
      if (src && !src.includes('enablejsapi=1')) {
        const separator = src.includes('?') ? '&' : '?'
        iframe.src = src + separator + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin)
      }
    })
  }
}

export function initializeVideoCarousel(): VideoCarousel {
  return new VideoCarousel()
}
