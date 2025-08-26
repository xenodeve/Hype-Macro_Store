import type { YouTubeMessageData } from '../types';

// Bootstrap-style Video Carousel
class VideoCarousel {
    private currentVideo: number = 0;
    private readonly maxVideos: number = 4;
    private autoPlayInterval: number | undefined;
    private timelineInterval: number | undefined;
    private isUserInteracting: boolean = false;
    private autoPlayPermanentlyStopped: boolean = false;
    private timelineStartTime: number = 0;
    private readonly autoPlayDuration: number = 10000; // 10 seconds
    
    private readonly carouselItems: NodeListOf<HTMLElement>;
    private readonly indicators: NodeListOf<HTMLElement>;
    private readonly prevBtn: HTMLElement | null;
    private readonly nextBtn: HTMLElement | null;
    private readonly timelineProgress: HTMLElement | null;
    private readonly timelineContainer: HTMLElement | null;

    constructor() {
        this.carouselItems = document.querySelectorAll('.carousel-item');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        this.prevBtn = document.querySelector('.carousel-control-prev');
        this.nextBtn = document.querySelector('.carousel-control-next');
        this.timelineProgress = document.querySelector('.timeline-progress');
        this.timelineContainer = document.querySelector('.auto-play-timeline');
        
        this.init();
    }

    private init(): void {
        this.setupBootstrapCarousel();
        this.setupManualControls();
        this.setupVideoInteraction();
        this.setupYouTubeAPI();
        this.startAutoPlay();
    }

    // Setup Bootstrap-style carousel functionality
    private setupBootstrapCarousel(): void {
        // Initialize first item and indicator as active
        this.updateCarouselDisplay();
        
        // Setup indicator click events
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
    }

    // Update carousel display (items and indicators)
    private updateCarouselDisplay(): void {
        // Update carousel items
        this.carouselItems.forEach((item, index) => {
            if (index === this.currentVideo) {
                item.classList.add('active');
                item.style.display = 'block';
            } else {
                item.classList.remove('active');
                item.style.display = 'none';
            }
        });

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentVideo) {
                indicator.classList.add('active');
                indicator.classList.remove('bg-gray-300', 'dark:bg-gray-500');
                indicator.classList.add('bg-blue-500');
            } else {
                indicator.classList.remove('active', 'bg-blue-500');
                indicator.classList.add('bg-gray-300', 'dark:bg-gray-500');
            }
        });
    }

    // Go to specific slide
    private goToSlide(slideIndex: number): void {
        if (slideIndex >= 0 && slideIndex < this.maxVideos) {
            this.currentVideo = slideIndex;
            this.updateCarouselDisplay();
            this.stopAutoPlay();
            this.resetTimeline();
            
            // Restart auto-play after user interaction timeout
            setTimeout(() => this.startAutoPlay(), 1800000); // 30 minutes
        }
    }

    // Start auto-play functionality
    private startAutoPlay(): void {
        if (this.autoPlayPermanentlyStopped) {
            return;
        }

        this.resetTimeline();
        this.startTimeline();

        this.autoPlayInterval = window.setInterval((): void => {
            if (!this.isUserInteracting && !this.autoPlayPermanentlyStopped) {
                this.nextSlide();
                this.resetTimeline();
                this.startTimeline();
            }
        }, this.autoPlayDuration);
    }

    private stopAutoPlay(): void {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = undefined;
        }
        this.stopTimeline();
    }

    private permanentlyStopAutoPlay(): void {
        this.autoPlayPermanentlyStopped = true;
        this.stopAutoPlay();
        this.hideTimeline();
    }

    // Timeline management
    private startTimeline(): void {
        if (!this.timelineProgress || this.autoPlayPermanentlyStopped) {
            return;
        }

        this.timelineStartTime = Date.now();
        this.timelineProgress.style.width = '0%';
        this.timelineProgress.classList.remove('paused');

        this.timelineInterval = window.setInterval(() => {
            if (!this.isUserInteracting && !this.autoPlayPermanentlyStopped) {
                const elapsed = Date.now() - this.timelineStartTime;
                const progress = Math.min((elapsed / this.autoPlayDuration) * 100, 100);
                
                if (this.timelineProgress) {
                    this.timelineProgress.style.width = `${progress}%`;
                }

                if (progress >= 100) {
                    this.stopTimeline();
                }
            }
        }, 50); // Update every 50ms for smooth animation
    }

    private stopTimeline(): void {
        if (this.timelineInterval) {
            clearInterval(this.timelineInterval);
            this.timelineInterval = undefined;
        }
        
        if (this.timelineProgress) {
            this.timelineProgress.classList.add('paused');
        }
    }

    private resetTimeline(): void {
        if (this.timelineProgress) {
            this.timelineProgress.style.width = '0%';
            this.timelineProgress.classList.remove('paused');
        }
    }

    private hideTimeline(): void {
        if (this.timelineContainer) {
            this.timelineContainer.classList.add('stopped');
        }
    }

    // Navigate to next slide
    private nextSlide(): void {
        this.currentVideo = (this.currentVideo + 1) % this.maxVideos;
        this.updateCarouselDisplay();
    }

    // Navigate to previous slide
    private prevSlide(): void {
        this.currentVideo = this.currentVideo === 0 ? this.maxVideos - 1 : this.currentVideo - 1;
        this.updateCarouselDisplay();
    }

    // Setup manual controls (prev/next buttons)
    private setupManualControls(): void {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
                this.stopAutoPlay();
                this.resetTimeline();
                setTimeout(() => this.startAutoPlay(), 1800000); // 30 minutes
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
                this.stopAutoPlay();
                this.resetTimeline();
                setTimeout(() => this.startAutoPlay(), 1800000); // 30 minutes
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.stopAutoPlay();
                this.resetTimeline();
                setTimeout(() => this.startAutoPlay(), 1800000);
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.stopAutoPlay();
                this.resetTimeline();
                setTimeout(() => this.startAutoPlay(), 1800000);
            }
        });
    }

    // Setup video interaction handlers
    private setupVideoInteraction(): void {
        const videoContainers = document.querySelectorAll('.carousel-item .video-item') as NodeListOf<HTMLElement>;
        
        videoContainers.forEach((container: HTMLElement): void => {
            // Pause auto-play when hovering over video
            container.addEventListener('mouseenter', (): void => {
                this.isUserInteracting = true;
                this.stopTimeline();
            });

            // Resume auto-play when leaving video area
            container.addEventListener('mouseleave', (): void => {
                setTimeout((): void => {
                    this.isUserInteracting = false;
                    if (!this.autoPlayPermanentlyStopped) {
                        this.resetTimeline();
                        this.startTimeline();
                    }
                }, 2000); // Wait 2 seconds before resuming
            });

            // Stop auto-play permanently when clicking on video
            container.addEventListener('click', (): void => {
                this.permanentlyStopAutoPlay();
            });
        });

        // Timeline container interactions
        if (this.timelineContainer) {
            this.timelineContainer.addEventListener('mouseenter', () => {
                this.isUserInteracting = true;
                this.stopTimeline();
            });

            this.timelineContainer.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    this.isUserInteracting = false;
                    if (!this.autoPlayPermanentlyStopped) {
                        this.resetTimeline();
                        this.startTimeline();
                    }
                }, 1000);
            });
        }
    }

    // Setup YouTube API integration
    private setupYouTubeAPI(): void {
        // Listen for YouTube player events via postMessage API
        window.addEventListener('message', (event: MessageEvent): void => {
            if (event.origin !== 'https://www.youtube.com') {
                return;
            }

            try {
                const data: YouTubeMessageData = JSON.parse(event.data);

                // Handle YouTube player state changes
                if (data.event === 'video-progress' || data.event === 'onStateChange') {
                    if (data.info && data.info.playerState !== undefined) {
                        const playerState: number = data.info.playerState;

                        if (playerState === 1) { // Video is playing
                            this.permanentlyStopAutoPlay();
                        }
                    }
                }
            } catch (e) {
                // Ignore data parsing errors
            }
        });

        // Enable YouTube iframe API for all videos
        const iframes = document.querySelectorAll('.carousel-item iframe') as NodeListOf<HTMLIFrameElement>;
        iframes.forEach((iframe: HTMLIFrameElement): void => {
            const src: string = iframe.src;
            if (src && !src.includes('enablejsapi=1')) {
                const separator: string = src.includes('?') ? '&' : '?';
                iframe.src = src + separator + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
            }
        });
    }

    // Public methods for external control
    public getCurrentSlide(): number {
        return this.currentVideo;
    }

    public goToSlidePublic(index: number): void {
        this.goToSlide(index);
    }

    public play(): void {
        this.startAutoPlay();
    }

    public pause(): void {
        this.stopAutoPlay();
    }

    public isAutoPlayActive(): boolean {
        return !this.autoPlayPermanentlyStopped && this.autoPlayInterval !== undefined;
    }
}

// Export function to initialize video carousel
export function initializeVideoCarousel(): VideoCarousel {
    return new VideoCarousel();
}
