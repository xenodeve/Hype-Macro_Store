# 🎮 HYPE-MACRO Store - Full-Stack Application

Full-stack web application สำหรับแสดงและจำหน่ายผลิตภัณฑ์ **HYPE-MACRO Premium Gaming Mouse** ที่พัฒนาด้วย **React + TypeScript** สำหรับ Frontend และ **NestJS + MongoDB** สำหรับ Backend API

---

## 🌟 คุณสมบัติเด่น

### 🖱️ **Premium Gaming Mouse Features**
- 🔧 **Omron Switch 20M** - สวิตช์คุณภาพสูงที่ทนทานถึง 20 ล้านครั้งการกด
- ⚡ **Polling Rate 8K** - อัตราการอัปเดตตำแหน่ง 8,000 Hz ที่รวดเร็วที่สุดในตลาด
- 💎 **Premium Materials** - ผลิตจากพลาสติก ABS คุณภาพสูงเคลือบสีขาวเนื้อด้าน
- 🎯 **Professional Gaming** - ออกแบบมาเพื่อเกมเมอร์ทุกระดับ

### 🚀 **Full-Stack Architecture**
- ⚛️ **React 19** - Frontend framework ที่ทันสมัยพร้อม TypeScript
- 🏗️ **NestJS** - Backend framework แบบ Progressive Node.js
- 🍃 **MongoDB** - NoSQL database สำหรับจัดเก็บข้อมูล
- 🔐 **JWT Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- 📦 **Redux Toolkit** - State management ที่มีประสิทธิภาพ
- 🎨 **Vite** - Build tool ที่รวดเร็วและทันสมัย

### 🎨 **Modern Web Design**
- 🌓 **Dark/Light Mode** - รองรับโหมดมืดและสว่างพร้อมการปรับตามระบบอัตโนมัติ
- 📱 **Fully Responsive** - ใช้งานได้ลื่นไหลในทุกอุปกรณ์และขนาดหน้าจอ
- ✨ **Smooth Animations** - แอนิเมชั่นที่ลื่นไหลด้วย GSAP และ Motion
- 🎬 **Interactive UI** - ประสบการณ์ผู้ใช้ที่น่าประทับใจ
- 🔄 **Real-time Updates** - อัปเดตข้อมูลแบบ real-time

### 🔧 **Advanced Features**
- 🛒 **Product Management** - ระบบจัดการสินค้าที่สมบูรณ์
- 👤 **User Authentication** - ระบบสมัครสมาชิกและเข้าสู่ระบบ
- 📊 **RESTful API** - API ที่ออกแบบตามมาตรฐาน REST
- 🔒 **Password Encryption** - เข้ารหัสรหัสผ่านด้วย bcrypt
- ✅ **Data Validation** - ตรวจสอบความถูกต้องของข้อมูลทั้ง Frontend และ Backend
- 🌐 **CORS Support** - รองรับการเชื่อมต่อข้าม domain

---

## 💻 เทคโนโลยีที่ใช้

### 🎨 **Frontend (React)**
- **React 19.1.1** - UI library ที่ทันสมัยที่สุด
- **TypeScript** - Type-safe JavaScript สำหรับการพัฒนาที่มั่นคง
- **Vite 7** - Build tool และ dev server ที่รวดเร็ว
- **Redux Toolkit** - State management ที่ทรงพลัง
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client สำหรับเรียก API
- **GSAP** - Animation library ระดับมืออาชีพ
- **Motion** - Modern animation library สำหรับ React
- **ESLint** - Code linting และ quality checks

### ⚙️ **Backend (NestJS)**
- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe backend development
- **MongoDB + Mongoose** - NoSQL database และ ODM
- **Passport + JWT** - Authentication strategy
- **Bcrypt** - Password hashing
- **Class Validator** - DTO validation
- **Class Transformer** - Object transformation
- **Jest** - Testing framework
- **Prettier** - Code formatting

---

## 📁 โครงสร้างโปรเจ็กต์

```
Hype-Macro_Store/
├── React/                      # Frontend Application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main App component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tsconfig.json         # TypeScript config
│   └── README.md             # Frontend README
│
├── Nestjs/                    # Backend Application
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # Users module
│   │   ├── products/         # Products module
│   │   ├── common/           # Common utilities
│   │   ├── app.module.ts     # Root module
│   │   └── main.ts           # Entry point
│   ├── test/                 # Test files
│   ├── package.json          # Backend dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── nest-cli.json         # NestJS CLI config
│   └── README.md             # Backend README
│
└── README.md                  # This file
```

---

## 🛠️ การติดตั้งและใช้งาน

### 📋 **ความต้องการระบบ**
- **Node.js** 20+ และ npm/yarn
- **MongoDB** 6.0+ (Local หรือ Cloud เช่น MongoDB Atlas)
- **Git** สำหรับ version control
- **เว็บเบราว์เซอร์ที่ทันสมัย**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

### ⚡ **Quick Start**

#### 1. **Clone โปรเจ็กต์**
```bash
git clone https://github.com/xenodeve/Hype-Macro_Store.git
cd Hype-Macro_Store
git checkout React+Nestjs
```

#### 2. **ติดตั้ง Backend (NestJS)**
```bash
cd Nestjs
npm install

# สร้างไฟล์ .env และตั้งค่า
# MongoDB connection string และ JWT secret
```

**สร้างไฟล์ `.env` ใน folder Nestjs:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hype-macro-store
# หรือใช้ MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hype-macro-store

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=7d

# Server
PORT=3000
```

**รัน Backend Server:**
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Run with seeding data (optional)
npm run seed
```

Backend API จะรันที่: `http://localhost:3000`

#### 3. **ติดตั้ง Frontend (React)**
```bash
cd ../React
npm install

# สร้างไฟล์ .env สำหรับ API endpoint (ถ้าต้องการ)
```

**สร้างไฟล์ `.env` ใน folder React (optional):**
```env
VITE_API_URL=http://localhost:3000/api
```

**รัน Frontend Application:**
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend จะรันที่: `http://localhost:5173`

#### 4. **เปิดเว็บไซต์**
เปิดเบราว์เซอร์และไปที่ `http://localhost:5173`

---

## 🎯 API Endpoints

### 🔐 **Authentication**
```
POST   /api/auth/register     # สมัครสมาชิกใหม่
POST   /api/auth/login        # เข้าสู่ระบบ
GET    /api/auth/profile      # ดูข้อมูลโปรไฟล์ (ต้อง JWT)
```

### 👥 **Users**
```
GET    /api/users             # รายการผู้ใช้ทั้งหมด
GET    /api/users/:id         # ข้อมูลผู้ใช้ตาม ID
PUT    /api/users/:id         # อัปเดตข้อมูลผู้ใช้
DELETE /api/users/:id         # ลบผู้ใช้
```

### 🛍️ **Products**
```
GET    /api/products          # รายการสินค้าทั้งหมด
GET    /api/products/:id      # ข้อมูลสินค้าตาม ID
POST   /api/products          # เพิ่มสินค้าใหม่ (Admin)
PUT    /api/products/:id      # อัปเดตข้อมูลสินค้า (Admin)
DELETE /api/products/:id      # ลบสินค้า (Admin)
```

---

## 🧪 การทดสอบ

### **Backend Testing**
```bash
cd Nestjs

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### **Frontend Testing**
```bash
cd React

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🎨 การปรับแต่ง

### 🎭 **Frontend Customization**

**แก้ไข Theme และ Styles:**
```typescript
// React/src/App.tsx หรือ theme configuration
const theme = {
  colors: {
    primary: '#your-color',
    secondary: '#your-color',
    accent: '#your-color',
  },
  // ...
};
```

**แก้ไข API Base URL:**
```typescript
// React/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### ⚙️ **Backend Customization**

**แก้ไข MongoDB Schema:**
```typescript
// Nestjs/src/products/schemas/product.schema.ts
@Schema()
export class Product {
  // เพิ่ม fields ใหม่
}
```

**เพิ่ม API Endpoints:**
```typescript
// Nestjs/src/products/products.controller.ts
@Get('custom-endpoint')
async customEndpoint() {
  // Custom logic
}
```

---

## 🔧 คุณสมบัติเทคนิค

### 🏗️ **Architecture Patterns**
- **MVC Pattern** - Model-View-Controller architecture
- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - NestJS built-in DI
- **DTO Pattern** - Data Transfer Objects
- **Redux Pattern** - Predictable state container

### 🔐 **Security Features**
- **JWT Authentication** - Token-based auth
- **Password Hashing** - bcrypt encryption
- **CORS Protection** - Cross-origin resource sharing
- **Validation Pipes** - Input validation
- **Environment Variables** - Secure configuration

### 📱 **Responsive Design**
```css
/* Mobile First Approach */
.container {
  /* Mobile styles */
}

@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### ✨ **Animation System**
- **GSAP** - Professional animation library
- **Motion** - React-specific animations
- **CSS3 Transitions** - Smooth transitions
- **Intersection Observer** - Scroll animations

---

## 🚀 Performance Optimization

### **Frontend**
- ⚡ **Vite Hot Module Replacement (HMR)** - รีโหลดแบบเร็ว
- 🗜️ **Code Splitting** - แยก bundle ตามหน้า
- 🖼️ **Lazy Loading** - โหลดรูปภาพแบบ lazy
- 📦 **Tree Shaking** - ลบ code ที่ไม่ได้ใช้
- 🎯 **Production Build Optimization** - minify และ compress

### **Backend**
- 🔄 **Connection Pooling** - MongoDB connection pool
- 📊 **Database Indexing** - เพิ่มประสิทธิภาพ query
- 🚀 **Caching Strategy** - cache ข้อมูลที่ใช้บ่อย
- ⚡ **Async Operations** - non-blocking operations
- 🔧 **PM2 Process Manager** - production deployment

---

## 🌐 การ Deploy

### **Backend Deployment**

#### **Railway / Render (แนะนำ)**
```bash
# เชื่อมต่อ GitHub repository
# ตั้งค่า Environment Variables:
# - MONGODB_URI
# - JWT_SECRET
# - PORT
# Build Command: cd Nestjs && npm install && npm run build
# Start Command: cd Nestjs && npm run start:prod
```

#### **Heroku**
```bash
cd Nestjs
heroku create hype-macro-api
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git subtree push --prefix Nestjs heroku main
```

### **Frontend Deployment**

#### **Vercel (แนะนำ)**
```bash
cd React
vercel

# Environment Variables:
# VITE_API_URL=https://your-backend-api.com/api
```

#### **Netlify**
```bash
# Build settings:
# Base directory: React
# Build command: npm run build
# Publish directory: React/dist

# Environment Variables:
# VITE_API_URL=https://your-backend-api.com/api
```

#### **GitHub Pages**
```bash
cd React
npm run build

# Deploy dist folder to gh-pages branch
```

---

## 🐛 การแก้ไขปัญหา

### **ปัญหาที่พบบ่อย**

#### **Backend Issues**
- **MongoDB Connection Failed**: ตรวจสอบ `MONGODB_URI` ใน `.env`
- **JWT Authentication Failed**: ตรวจสอบ `JWT_SECRET` และ token expiration
- **CORS Error**: ตรวจสอบ CORS configuration ใน `main.ts`
- **Port Already in Use**: เปลี่ยน PORT ใน `.env`

```bash
# ตรวจสอบ MongoDB connection
mongosh "your-connection-string"

# ตรวจสอบ port ที่ใช้งาน
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

#### **Frontend Issues**
- **API Connection Failed**: ตรวจสอบ `VITE_API_URL` และ backend server
- **Build Errors**: ลบ `node_modules` และติดตั้งใหม่
- **TypeScript Errors**: รัน `npm run lint` เพื่อตรวจสอบ

```bash
# ล้าง cache และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install

# ตรวจสอบ TypeScript
npx tsc --noEmit
```

### **Debug Commands**
```bash
# Backend
cd Nestjs
npm run start:debug  # Debug mode

# Frontend  
cd React
npm run dev -- --debug  # Debug mode
```

---

## 📊 Database Schema

### **User Model**
```typescript
{
  username: string;      // unique
  email: string;         // unique
  password: string;      // hashed
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### **Product Model**
```typescript
{
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  features: string[];
  isLimited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🏆 Features Showcase

### 🎮 **Full-Stack Architecture**
- **Separation of Concerns** - แยก Frontend และ Backend อย่างชัดเจน
- **Type Safety** - ใช้ TypeScript ทั้ง Frontend และ Backend
- **Scalable Structure** - โครงสร้างที่พร้อมขยายได้
- **Professional Code** - Code quality สูงและมาตรฐาน

### 💫 **Modern Development Practices**
- **RESTful API Design** - API ที่ตามมาตรฐาน
- **JWT Authentication** - ระบบ auth ที่ปลอดภัย
- **State Management** - Redux Toolkit สำหรับ global state
- **Error Handling** - จัดการ error อย่างเป็นระบบ
- **Validation** - validate ข้อมูลทั้ง Frontend และ Backend

### 🔐 **Security & Best Practices**
- **Environment Variables** - แยกการตั้งค่าออกจาก code
- **Password Encryption** - เข้ารหัสรหัสผ่าน
- **Input Validation** - ตรวจสอบข้อมูลก่อนประมวลผล
- **CORS Configuration** - ป้องกัน cross-origin attacks
- **TypeScript Strict Mode** - type checking ที่เข้มงวด

---

## 📈 Future Enhancements

### 🚀 **Planned Features**
- 📊 **Admin Dashboard** - หน้าจัดการสำหรับ admin
- 🛒 **Shopping Cart** - ตะกร้าสินค้าและระบบสั่งซื้อ
- 💳 **Payment Integration** - เชื่อมต่อ payment gateway
- 📧 **Email Notifications** - ส่ง email ยืนยันและแจ้งเตือน
- 🔍 **Search & Filter** - ค้นหาและกรองสินค้า
- ⭐ **Product Reviews** - รีวิวและให้คะแนนสินค้า
- 📱 **Mobile App** - React Native mobile application
- 🌍 **Multi-language** - รองรับหลายภาษา
- 📊 **Analytics Dashboard** - สถิติการใช้งาน
- 🔔 **Real-time Notifications** - แจ้งเตือนแบบ real-time ด้วย WebSocket

---

## 🔍 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI Library |
| **Frontend** | TypeScript | Type Safety |
| **Frontend** | Vite | Build Tool |
| **Frontend** | Redux Toolkit | State Management |
| **Frontend** | React Router | Routing |
| **Frontend** | Axios | HTTP Client |
| **Frontend** | GSAP/Motion | Animations |
| **Backend** | NestJS 10 | API Framework |
| **Backend** | TypeScript | Type Safety |
| **Backend** | MongoDB | Database |
| **Backend** | Mongoose | ODM |
| **Backend** | Passport/JWT | Authentication |
| **Backend** | Bcrypt | Password Hashing |
| **Testing** | Jest | Unit Testing |
| **Code Quality** | ESLint | Linting |
| **Code Quality** | Prettier | Formatting |

---

## 👨‍💻 ผู้พัฒนา

โปรเจ็กต์นี้พัฒนาโดยนักพัฒนาเว็บไซต์ที่มีความสนใจในเทคโนโลยี Gaming และ Full-stack Development

- **Developer**: [Xeno](https://github.com/xenodeve)
- **Student ID**: s0330250
- **Repository**: [Hype-Macro_Store](https://github.com/xenodeve/Hype-Macro_Store)
- **Branch**: React+Nestjs

### 🤝 **Contributing**
หากต้องการ contribute โปรเจ็กต์:
1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 📚 Documentation Links

### **Official Documentation**
- 📘 [React Documentation](https://react.dev/)
- 📗 [NestJS Documentation](https://docs.nestjs.com/)
- 📙 [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- 📕 [MongoDB Documentation](https://www.mongodb.com/docs/)
- 📓 [Vite Documentation](https://vite.dev/)
- 📔 [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

### **Useful Resources**
- 🎓 [NestJS Courses](https://courses.nestjs.com/)
- 🎥 [React Tutorial](https://react.dev/learn)
- 💬 [NestJS Discord](https://discord.gg/G7Qnnhy)
- 🌟 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 📜 License

© 2025 HYPE-RX. สงวนลิขสิทธิ์ทุกประการ

This project is for educational purposes.

---

## 🙏 Acknowledgments

- **NestJS Team** - สำหรับ framework ที่ยอดเยี่ยม
- **React Team** - สำหรับ library ที่ทรงพลัง
- **MongoDB** - สำหรับ database ที่ยืดหยุ่น
- **Open Source Community** - สำหรับเครื่องมือและไลบรารีที่ยอดเยี่ยม

---

### 🚀 Happy Coding! 🎮

**Built with ❤️ by Xeno | Full-Stack Developer**

---

## 📞 Support & Contact

หากมีคำถามหรือต้องการความช่วยเหลือ:
- 🐛 [Report Issues](https://github.com/xenodeve/Hype-Macro_Store/issues)
- 💬 [Discussions](https://github.com/xenodeve/Hype-Macro_Store/discussions)
- 📧 Email: [ติดต่อผ่าน GitHub](https://github.com/xenodeve)

---

**Last Updated**: 2025-11-05
**Version**: 1.0.0
**Status**: 🚧 In Active Development
