// tailwind.config = {
//     darkMode: 'class', // ใช้คลาสสำหรับโหมดมืด
//     theme: { // ธีมสำหรับการจัดแต่ง
//         extend: { // ส่วนขยายธีม
//             colors: { // สีต่างๆ ที่กำหนดเอง
//                 blue: "#2997FF", // สีน้ำเงินหลัก
//                 gray: { // สีเทาต่างๆ
//                     DEFAULT: "#86868b", // สีเทาเริ่มต้น
//                     100: "#f3f4f6",  // สีเทาอ่อน
//                     200: "#e6e6e6", // สีเทากลาง
//                     300: "#ffffff", // สีขาว
//                 },
//                 zinc: "#101010", // สีดำเข้ม
//             },
//             fontFamily: { // ตระกูลฟอนต์
//                 'ibmplexthai': ['IBM Plex Sans Thai', 'sans-serif'], // ฟอนต์ IBM Plex Sans Thai
//             }
//         }
//     }
// }

// กำหนด config สำหรับ dark mode colors
const darkModeColors = {
    blue: "#2997FF", // สีน้ำเงินหลัก
    gray: { // สีเทาต่างๆ
        DEFAULT: "#86868b", // สีเทาเริ่มต้น
        100: "#f3f4f6",  // สีเทาอ่อน
        200: "#e6e6e6", // สีเทากลาง
        300: "#ffffff", // สีขาว
    },
    zinc: "#101010", // สีดำเข้ม
};

// เก็บ config ใน window object
window.tailwindConfig = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: darkModeColors,
            fontFamily: {
                'ibmplexthai': ['IBM Plex Sans Thai', 'sans-serif'],
            }
        }
    }
};

// ตั้งค่า Tailwind
tailwind.config = window.tailwindConfig;