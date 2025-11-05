class LoadingPage {
  private loadingElement: HTMLElement | null = null
  private isLoading: boolean = true

  constructor() {
    document.body.classList.remove('content-loaded')
    this.createLoadingElement()
    this.init()
  }

  private createLoadingElement(): void {
    this.loadingElement = document.createElement('div')
    this.loadingElement.id = 'loading-page'
    this.loadingElement.className = 'loading-page'
    this.loadingElement.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">
                    <div class="hero-mouse-logo-glass w-32 h-20 rounded-full flex items-center justify-center mb-6 mx-auto transform-gpu">
                        <i class="fas fa-mouse text-white/120 text-4xl drop-shadow-lg relative z-10 transform-gpu"></i>
                    </div>
                    <h1 class="loading-title">HYPE-MACRO</h1>
                    <p class="loading-subtitle">Pro Gaming Experience</p>
                </div>
                <div class="loader"></div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p class="progress-text">กำลังโหลด...</p>
                </div>
            </div>
        `
    document.body.appendChild(this.loadingElement)
  }

  private init(): void {
    this.startProgressAnimation()
    this.simulateLoading()
  }

  private startProgressAnimation(): void {
    const progressFill = this.loadingElement?.querySelector('.progress-fill') as HTMLElement | null
    if (progressFill) {
      progressFill.style.width = '0%'
      progressFill.style.transition = 'width 0.8s ease-out'
      setTimeout(() => {
        progressFill.style.width = '100%'
      }, 100)
    }
  }

  private simulateLoading(): void {
    const progressText = this.loadingElement?.querySelector('.progress-text') as HTMLElement | null
    const loadingSteps = ['กำลังเตรียมข้อมูล...', 'กำลังโหลดธีม...', 'กำลังโหลดคอมโพเนนต์...', 'เกือบเสร็จแล้ว...']
    let currentStep = 0
    const stepInterval = setInterval(() => {
      if (progressText && currentStep < loadingSteps.length) {
        progressText.textContent = loadingSteps[currentStep]
        currentStep++
      } else {
        clearInterval(stepInterval)
        setTimeout(() => this.hideLoading(), 100)
      }
    }, 200)
  }

  private hideLoading(): void {
    if (this.loadingElement) {
      this.loadingElement.classList.add('fade-out')
      document.body.classList.add('content-loaded')
      setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement)
        }
        this.isLoading = false
        this.onLoadingComplete()
      }, 800)
    }
  }

  private onLoadingComplete(): void {
    document.dispatchEvent(new CustomEvent('loadingComplete'))
  }

  public isCurrentlyLoading(): boolean {
    return this.isLoading
  }

  public forceHide(): void {
    if (this.isLoading) this.hideLoading()
  }
}

const STORAGE_KEY = 'hype-macro:first-load'
let hasShownLoading = false
let currentLoader: LoadingPage | null = null

export function initializeLoadingPage(): LoadingPage | null {
  if (currentLoader?.isCurrentlyLoading()) {
    return currentLoader
  }

  let storedFlag = false
  try {
    storedFlag = window.sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    storedFlag = hasShownLoading
  }

  if (hasShownLoading || storedFlag) {
    document.body.classList.add('content-loaded')
    const existing = document.getElementById('loading-page')
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing)
    }
    return null
  }

  hasShownLoading = true
  try {
    window.sessionStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    /* noop */
  }

  currentLoader = new LoadingPage()

  const handleComplete = () => {
    currentLoader = null
    document.removeEventListener('loadingComplete', handleComplete)
  }

  document.addEventListener('loadingComplete', handleComplete)

  return currentLoader
}

export { LoadingPage }
