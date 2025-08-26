// คลาสจัดการหน้าโหลด
class LoadingPage {
    private loadingElement: HTMLElement | null = null;
    private isLoading: boolean = true;

    constructor() {
        // เพิ่ม body class ทันทีเมื่อเริ่มโหลด
        document.body.classList.remove('content-loaded');
        this.createLoadingElement();
        this.init();
    }

    // สร้างองค์ประกอบหน้าโหลด
    private createLoadingElement(): void {
        this.loadingElement = document.createElement('div');
        this.loadingElement.id = 'loading-page';
        this.loadingElement.className = 'loading-page';
        
        // โครงสร้าง HTML สำหรับหน้าโหลด
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
        `;

        // เพิ่มเข้าใน body
        document.body.appendChild(this.loadingElement);
    }

    // เริ่มต้นหน้าโหลด
    private init(): void {
        this.startProgressAnimation();
        this.simulateLoading();
    }

    // แอนิเมชั่นแถบความคืบหน้า
    private startProgressAnimation(): void {
        const progressFill = this.loadingElement?.querySelector('.progress-fill') as HTMLElement;
        if (progressFill) {
            progressFill.style.width = '0%';
            progressFill.style.transition = 'width 0.8s ease-out'; // เปลี่ยนจาก 2.5s เป็น 0.8s
            
            // เริ่มแอนิเมชั่นหลังจาก 100ms
            setTimeout(() => {
                progressFill.style.width = '100%';
            }, 100);
        }
    }

    // จำลองการโหลด
    private simulateLoading(): void {
        const progressText = this.loadingElement?.querySelector('.progress-text') as HTMLElement;
        const loadingSteps = [
            'กำลังเตรียมข้อมูล...',
            'กำลังโหลดธีม...',
            'กำลังโหลดคอมโพเนนต์...',
            'เกือบเสร็จแล้ว...'
        ];

        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (progressText && currentStep < loadingSteps.length) {
                progressText.textContent = loadingSteps[currentStep];
                currentStep++;
            } else {
                clearInterval(stepInterval);
                // ซ่อนหน้าโหลดหลังจาก 1 วินาที (ลดจาก 3+ วินาที)
                setTimeout(() => {
                    this.hideLoading();
                }, 100); // ลด delay ลง
            }
        }, 200); // เปลี่ยนจาก 500ms เป็น 200ms ต่อ step
    }

    // ซ่อนหน้าโหลด
    private hideLoading(): void {
        if (this.loadingElement) {
            // เริ่ม fade out animation
            this.loadingElement.classList.add('fade-out');
            
            // เปลี่ยน body class เพื่อเริ่มการเปลี่ยนผ่านพื้นหลัง
            document.body.classList.add('content-loaded');
            
            // ลบองค์ประกอบหลังจากแอนิเมชั่นเสร็จ
            setTimeout(() => {
                if (this.loadingElement && this.loadingElement.parentNode) {
                    this.loadingElement.parentNode.removeChild(this.loadingElement);
                }
                this.isLoading = false;
                
                // เรียกใช้ callback เมื่อโหลดเสร็จ
                this.onLoadingComplete();
            }, 800); // ให้เวลาแอนิเมชั่น fade out เสร็จสิ้น
        }
    }

    // ฟังก์ชั่นที่เรียกเมื่อโหลดเสร็จ
    private onLoadingComplete(): void {
        // ส่งสัญญาณว่าโหลดเสร็จแล้ว
        document.dispatchEvent(new CustomEvent('loadingComplete'));
        
        // body.content-loaded ถูกเพิ่มไปแล้วใน hideLoading()
        // ไม่จำเป็นต้องเพิ่มซ้ำ
    }

    // เช็คสถานะการโหลด
    public isCurrentlyLoading(): boolean {
        return this.isLoading;
    }

    // บังคับซ่อนหน้าโหลด (สำหรับกรณีฉุกเฉิน)
    public forceHide(): void {
        if (this.isLoading) {
            this.hideLoading();
        }
    }
}

// ส่งออกฟังก์ชั่นสำหรับเริ่มต้นหน้าโหลด
export function initializeLoadingPage(): LoadingPage {
    return new LoadingPage();
}

// ส่งออกคลาสสำหรับการใช้งานขั้นสูง
export { LoadingPage };
