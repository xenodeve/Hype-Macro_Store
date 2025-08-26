import type { YouTubeMessageData } from '../types';

// คาร์รูเซลวิดีโอ - คาร์รูเซลวิดีโอ
class VideoCarousel {
    private currentVideo: number = 0; // วิดีโอปัจจุบัน
    private readonly maxVideos: number = 4; // จำนวนวิดีโอทั้งหมด
    private autoPlayInterval: number | undefined; // ตัวแปรเก็บ interval สำหรับเล่นอัตโนมัติ
    private isUserInteracting: boolean = false; // สถานะการโต้ตอบของผู้ใช้
    private autoPlayPermanentlyStopped: boolean = false; // แฟล็กหยุดเล่นอัตโนมัติถาวร
    
    private readonly videoCarousel: HTMLElement | null;
    private readonly prevBtn: HTMLElement | null;
    private readonly nextBtn: HTMLElement | null;

    constructor() {
        this.videoCarousel = document.getElementById('videoCarousel');
        this.prevBtn = document.getElementById('prevVideo');
        this.nextBtn = document.getElementById('nextVideo');
        
        this.init();
    }

    private init(): void {
        this.setupManualControls();
        this.setupVideoInteraction();
        this.setupYouTubeAPI();
        this.startAutoPlay();
    }

    // ฟังก์ชั่นอัปเดตตำแหน่งคาร์รูเซล
    private updateCarousel(): void {
        if (this.videoCarousel) {
            const translateX: number = this.currentVideo * -476; // คำนวณระยะเลื่อน (29.75rem = 476px)
            this.videoCarousel.style.transform = `translateX(${translateX}px)`; // เลื่อนคาร์รูเซล
        }
    }

    // ฟังก์ชั่นเริ่มเล่นอัตโนมัติ
    private startAutoPlay(): void {
        // ไม่เริ่มเล่นอัตโนมัติถ้าถูกหยุดถาวรแล้ว
        if (this.autoPlayPermanentlyStopped) {
            return;
        }

        // ตั้งเวลาเล่นอัตโนมัติทุก 10 วินาที
        this.autoPlayInterval = window.setInterval((): void => {
            if (!this.isUserInteracting && !this.autoPlayPermanentlyStopped) {
                this.currentVideo = (this.currentVideo + 1) % this.maxVideos;
                this.updateCarousel();
            }
        }, 10000);
    }

    private stopAutoPlay(): void {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = undefined;
        }
    }

    private permanentlyStopAutoPlay(): void {
        this.autoPlayPermanentlyStopped = true;
        this.stopAutoPlay();
    }

    // ปุ่มควบคุมด้วยตนเอง
    private setupManualControls(): void {
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', (): void => {
                this.currentVideo = this.currentVideo === 0 ? this.maxVideos - 1 : this.currentVideo - 1;
                this.updateCarousel();
                this.stopAutoPlay();
                setTimeout(() => this.startAutoPlay(), 1800000); // เริ่ม auto-play ใหม่หลังจาก 30 นาที
            });

            this.nextBtn.addEventListener('click', (): void => {
                this.currentVideo = this.currentVideo === this.maxVideos - 1 ? 0 : this.currentVideo + 1;
                this.updateCarousel();
                this.stopAutoPlay();
                setTimeout(() => this.startAutoPlay(), 1800000); // เริ่ม auto-play ใหม่หลังจาก 30 นาที
            });
        }
    }

    // ตรวจสอบเมื่อผู้ใช้กำลังโต้ตอบกับวิดีโอ YouTube
    private setupVideoInteraction(): void {
        const videoContainers = document.querySelectorAll('.video-item') as NodeListOf<HTMLElement>;
        
        videoContainers.forEach((container: HTMLElement): void => {
            // หยุด auto-play เมื่อ user นำ cursor ไปชี้ที่ video
            container.addEventListener('mouseenter', (): void => {
                this.isUserInteracting = true;
            });

            // กลับมาเล่น auto-play เมื่อ user เอา cursor ออกจากพื้นที่วิดีโอ
            container.addEventListener('mouseleave', (): void => {
                setTimeout((): void => {
                    this.isUserInteracting = false;
                }, 2000); // รอ 2 วินาทีก่อนกลับมาเล่น
            });

            // หยุดเล่น auto-play ถาวรเมื่อ user คลิกที่พื้นที่วิดีโอ
            container.addEventListener('click', (): void => {
                this.permanentlyStopAutoPlay();
            });
        });
    }

    // การเชื่อมต่อ YouTube API
    private setupYouTubeAPI(): void {
        // ฟังเหตุการณ์ของ YouTube player ผ่าน postMessage API
        window.addEventListener('message', (event: MessageEvent): void => {
            // ตรวจสอบว่าข้อความมาจาก YouTube หรือไม่
            if (event.origin !== 'https://www.youtube.com') {
                return;
            }

            try {
                const data: YouTubeMessageData = JSON.parse(event.data);

                // สถานะของ YouTube player เปลี่ยนแปลง
                if (data.event === 'video-progress' || data.event === 'onStateChange') {
                    if (data.info && data.info.playerState !== undefined) {
                        const playerState: number = data.info.playerState;

                        if (playerState === 1) { // วิดีโอกำลังเล่น
                            this.permanentlyStopAutoPlay();
                        }
                    }
                }
            } catch (e) {
                // ไม่สนใจข้อผิดพลาดในการแปลงข้อมูล
            }
        });

        // เปิดใช้งาน YouTube iframe API สำหรับวิดีโอทั้งหมด
        const iframes = document.querySelectorAll('.video-item iframe') as NodeListOf<HTMLIFrameElement>;
        iframes.forEach((iframe: HTMLIFrameElement): void => {
            const src: string = iframe.src;
            if (src && !src.includes('enablejsapi=1')) {
                const separator: string = src.includes('?') ? '&' : '?';
                iframe.src = src + separator + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
            }
        });
    }
}

// ส่งออกฟังก์ชั่นสำหรับเริ่มต้นคาร์รูเซลวิดีโอ
export function initializeVideoCarousel(): void {
    new VideoCarousel();
}
