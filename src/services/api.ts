import axios from 'axios';

/**
 * API Base URL
 * ดึงจาก environment variable (VITE_API_URL)
 * ถ้าไม่มีจะใช้ localhost:3000 (development)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Axios Instance
 * สร้าง axios instance สำหรับเรียก API
 * - baseURL: กำหนด base URL สำหรับทุก request
 * - headers: กำหนด default headers
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * เพิ่ม JWT token ลง Authorization header อัตโนมัติ
 * - อ่าน token จาก localStorage
 * - แนบ token ในทุก request ที่ต้องการ authentication
 */
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    try {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

/**
 * Response Interceptor
 * จัดการ error responses
 * - 401 Unauthorized: ล้างข้อมูล auth และ redirect ไป login
 * - อื่นๆ: ส่ง error ต่อไป
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ล้าง auth data และ redirect ไป login
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
