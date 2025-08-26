// แอนิเมชั่นการ์ดสินค้า (เลย์เอาต์กริดแบบคงที่)
export function setupProductCardsAnimation(): void {
    const productCards = document.querySelectorAll('#products .group') as NodeListOf<HTMLElement>;
    
    productCards.forEach((card: HTMLElement, index: number): void => {
        // เพิ่มแอนิเมชั่นเข้าแบบเป็นขั้นตอน
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout((): void => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));

        // เอฟเฟกต์โฮเวอร์ที่ปรับปรุงแล้ว
        card.addEventListener('mouseenter', (): void => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', (): void => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Intersection Observer สำหรับแอนิเมชั่นการ์ดสินค้าเมื่อเลื่อน
    const productObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry, index: number): void => {
            if (entry.isIntersecting) {
                setTimeout((): void => {
                    entry.target.classList.add('animate-fade-in');
                }, 100 * index);
            }
        });
    }, { threshold: 0.1 });

    // สังเกตการณ์การ์ดสินค้า
    productCards.forEach((card: HTMLElement): void => {
        productObserver.observe(card);
    });
}

// แอนิเมชั่นส่วน Hero
export function setupHeroAnimations(): void {
    window.addEventListener('load', (): void => {
        setTimeout((): void => {
            const heroTitle = document.getElementById('hero-title') as HTMLElement;
            if (heroTitle) {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }
        }, 500);

        setTimeout((): void => {
            const heroSubtitle = document.getElementById('hero-subtitle') as HTMLElement;
            if (heroSubtitle) {
                heroSubtitle.style.opacity = '1';
                heroSubtitle.style.transform = 'translateY(0)';
            }
        }, 1000);

        setTimeout((): void => {
            const heroCta = document.getElementById('hero-cta') as HTMLElement;
            if (heroCta) {
                heroCta.style.opacity = '1';
                heroCta.style.transform = 'translateY(0)';
            }
        }, 1500);
    });
}

// แอนิเมชั่นส่วนฟีเจอร์
export function setupFeatureAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // สังเกตการณ์ส่วนฟีเจอร์ทั้งหมด
    document.querySelectorAll('#features > div > div').forEach((el: Element): void => {
        observer.observe(el);
    });
}
