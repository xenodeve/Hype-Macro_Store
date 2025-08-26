// นำเข้าโมดูลต่างๆ
import { setRandomVideo } from './components/VideoBackground';
import { initializeTheme, onClick, reflectThemePreference, setupSystemThemeListener } from './components/ThemeToggle';
import { setupMobileMenu, setupSmoothNavigation } from './components/Navigation';
import { initializeVideoCarousel } from './components/VideoCarousel';
import { setupProductCardsAnimation, setupHeroAnimations, setupFeatureAnimations } from './components/Animations';
import { initializeLoadingPage } from './components/LoadingPage';
import { initializeHoverManager } from './components/HoverManager';

// เริ่มต้นหน้าโหลดทันที
initializeLoadingPage();

// เริ่มต้นธีมทันทีเมื่อสคริปต์โหลด
initializeTheme();

// ฟังก์ชั่นเริ่มต้นแอปพลิเคชั่นหลัก
function initializeMainApp(): void {
    // ตั้งค่าพื้นหลังวิดีโอ
    setRandomVideo();
    
    // ตั้งค่าการเปลี่ยนธีม
    reflectThemePreference();
    const themeToggle = document.querySelector('#theme-toggle') as HTMLElement;
    if (themeToggle) {
        themeToggle.addEventListener('click', onClick);
    }
    
    // ตั้งค่าการนำทาง
    setupMobileMenu();
    setupSmoothNavigation();
    
    // ตั้งค่าคาร์รูเซลวิดีโอ
    initializeVideoCarousel();
    
    // ตั้งค่าแอนิเมชั่น
    setupProductCardsAnimation();
    setupHeroAnimations();
    setupFeatureAnimations();
    
    // ตั้งค่าระบบจัดการ group hover
    initializeHoverManager();
    
    // ตั้งค่าการฟังการเปลี่ยนแปลงธีมระบบ
    setupSystemThemeListener();
}

// ฟัง event การโหลดเสร็จ
document.addEventListener('loadingComplete', (): void => {
    console.log('🚀 Loading complete! Starting main application...');
});

// เมื่อหน้าเว็บโหลดเสร็จ
window.onload = (): void => {
    // เริ่มต้นแอปพลิเคชั่นหลัก (จะทำงานขณะที่หน้าโหลดยังแสดงอยู่)
    setTimeout(() => {
        initializeMainApp();
    }, 1000); // รอ 1 วินาทีเพื่อให้หน้าโหลดแสดงผลก่อน
};