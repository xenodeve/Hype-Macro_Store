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
    },
    plugins: [
    function ({ addVariant }) { //เพิ่ม variable เพื่อสามารถใช้ Multi Group ได้
      addVariant('group1-hover', '.group1:hover &');
      addVariant('group2-hover', '.group2:hover &');
      addVariant('group3-hover', '.group3:hover &');
      // เพิ่มได้ตามต้องการ
    }
  ]
};

// ตั้งค่า Tailwind โดยใช้ window
tailwind.config = window.tailwindConfig;