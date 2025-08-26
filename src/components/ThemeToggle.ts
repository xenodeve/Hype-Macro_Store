import type { Theme } from '../types';

// ระบบเปลี่ยนธีม - ฟังก์ชั่นเปลี่ยนธีม
const storageKey: string = 'theme-preference'; // คีย์สำหรับเก็บค่าธีมใน localStorage

// ฟังก์ชั่นดึงค่าธีมที่ต้องการ
const getColorPreference = (): string => {
    if (localStorage.getItem(storageKey)) // ถ้ามีค่าเก็บไว้ใน localStorage
        return localStorage.getItem(storageKey) as string; // คืนค่าที่เก็บไว้
    else // ถ้าไม่มีค่าเก็บไว้
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; // ใช้ค่าจากระบบ
};

// ออบเจ็กต์เก็บค่าธีม
export const theme: Theme = {
    value: getColorPreference(), // ค่าธีมปัจจุบัน
};

// ฟังก์ชั่นอัปเดตหน้าเว็บตามธีม
const reflectPreference = (): void => {
    document.firstElementChild?.setAttribute('data-theme', theme.value); // ตั้งค่า attribute ธีม
    document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value); // อัปเดต aria-label

    // สลับคลาส dark ของ Tailwind - เปลี่ยนคลาส dark ของ Tailwind
    if (theme.value === 'dark') { // ถ้าเป็นโหมดมืด
        document.documentElement.classList.add('dark'); // เพิ่มคลาส dark
    } else { // ถ้าเป็นโหมดสว่าง
        document.documentElement.classList.remove('dark'); // ลบคลาส dark
    }
};

// ฟังก์ชั่นบันทึกค่าธีม
const setPreference = (): void => {
    localStorage.setItem(storageKey, theme.value); // บันทึกค่าลง localStorage
    reflectPreference(); // อัปเดตหน้าเว็บ
};

// ฟังก์ชั่นคลิกเปลี่ยนธีม
export const onClick = (): void => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'; // สลับระหว่างโหมดสว่างและมืด
    setPreference(); // บันทึกค่าธีม
};

// ฟังก์ชั่นตั้งค่าธีมเริ่มต้นจากระบบปฏิบัติการ
export const initializeTheme = (): void => {
    const preferredTheme: string = getColorPreference(); // ดึงค่าธีมที่ต้องการ
    theme.value = preferredTheme; // ตั้งค่าธีม

    // ตั้งค่า data-theme attribute ทันที
    document.documentElement.setAttribute('data-theme', preferredTheme);

    // เพิ่ม/ลบ dark class สำหรับ Tailwind
    if (preferredTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    console.log(`🌙 Theme initialized: ${preferredTheme}`); // แสดงข้อความในคอนโซล
};

// ฟังก์ชั่นส่งออกสำหรับอัปเดตหน้าเว็บตามธีม
export const reflectThemePreference = reflectPreference;

// เมื่อการตั้งค่าระบบเปลี่ยน
export const setupSystemThemeListener = (): void => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }: MediaQueryListEvent): void => {
        theme.value = isDark ? 'dark' : 'light'; // อัปเดตค่าธีม
        setPreference(); // บันทึกค่าใหม่
    });
};
