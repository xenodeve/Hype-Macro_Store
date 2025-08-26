// ระบบเมนูมือถือ
export function setupMobileMenu(): void {
    const mobileMenuButton = document.getElementById('mobile-menu-button') as HTMLElement;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLElement;

    // เมื่อคลิกปุ่มเมนูมือถือ
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', (): void => {
            mobileMenu.classList.toggle('hidden'); // สลับการซ่อน/แสดงเมนู
        });
    }
}

// การนำทางแบบเรียบ - การนำทางแบบเรียบ
export function setupSmoothNavigation(): void {
    // ดึงลิงก์ทั้งหมดที่มี href ขึ้นต้นด้วย #
    const navLinks = document.querySelectorAll('a[href^="#"]') as NodeListOf<HTMLAnchorElement>;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLElement;

    navLinks.forEach((link: HTMLAnchorElement): void => {
        link.addEventListener('click', (e: Event): void => {
            e.preventDefault(); // หยุดการทำงานปกติของลิงก์

            const targetId: string = link.getAttribute('href')?.substring(1) || ''; // ตัด # ออก
            const targetSection = document.getElementById(targetId) as HTMLElement;

            if (targetSection) {
                // ปิดเมนูมือถือถ้าเปิดอยู่
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }

                // เลื่อนไปยังส่วนที่ต้องการ
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // อัปเดต URL โดยไม่เลื่อนหน้า
                window.history.pushState(null, '', `#${targetId}`);
            }
        });
    });
}
