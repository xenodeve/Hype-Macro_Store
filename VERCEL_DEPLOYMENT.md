# 🚀 การ Deploy โปรเจค HYPE-MACRO Store บน Vercel

คู่มือฉบับสมบูรณ์สำหรับการ deploy fullstack application (React + NestJS) บน Vercel

---

## 📋 สิ่งที่ต้องเตรียม

### 1. **Vercel Account**
- สมัครบัญชีที่ [vercel.com](https://vercel.com)
- เชื่อมต่อกับ GitHub account

### 2. **MongoDB Atlas**
- สร้าง MongoDB Atlas cluster (ฟรี) ที่ [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- รับ connection string
- เพิ่ม IP address `0.0.0.0/0` ใน Network Access (สำหรับ Vercel)

### 3. **GitHub Repository**
- Push โปรเจคขึ้น GitHub
- ตรวจสอบว่า branch ที่ต้องการ deploy มีไฟล์ครบถ้วน

---

## 🔧 ขั้นตอนการ Deploy

### **ขั้นตอนที่ 1: เตรียม Environment Variables**

คุณจะต้องตั้งค่า environment variables ต่อไปนี้ใน Vercel:

#### **สำหรับ Backend:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hype-macro-store?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-here
JWT_EXPIRATION=7d
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### **สำหรับ Frontend:**
```env
VITE_API_URL=/api
```

> **💡 วิธีสร้าง JWT_SECRET ที่ปลอดภัย:**
> ```bash
> # ใช้ Node.js
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> 
> # หรือใช้ OpenSSL
> openssl rand -hex 64
> ```

---

### **ขั้นตอนที่ 2: Import Project ไปยัง Vercel**

#### **วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)**

1. เข้าไปที่ [vercel.com/new](https://vercel.com/new)
2. เลือก **Import Git Repository**
3. เลือก repository `Hype-Macro_Store`
4. กำหนดค่าดังนี้:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (ใช้ root)
   - **Build Command**: ปล่อยว่างไว้ (ใช้ค่าจาก `vercel.json`)
   - **Output Directory**: ปล่อยว่างไว้

5. คลิก **Environment Variables** และเพิ่มตัวแปรทั้งหมดตามด้านบน

6. คลิก **Deploy**

#### **วิธีที่ 2: ผ่าน Vercel CLI**

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd Hype-Macro_Store
vercel

# ตั้งค่า environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRATION
vercel env add FRONTEND_URL
vercel env add NODE_ENV

# Deploy production
vercel --prod
```

---

### **ขั้นตอนที่ 3: ตั้งค่า Environment Variables**

1. ไปที่ Vercel Dashboard → เลือกโปรเจค
2. ไปที่ **Settings** → **Environment Variables**
3. เพิ่มตัวแปรทั้งหมด:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `JWT_SECRET` | `your-secret-key` | Production, Preview, Development |
| `JWT_EXPIRATION` | `7d` | Production, Preview, Development |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |
| `VITE_API_URL` | `/api` | Production, Preview, Development |

4. คลิก **Save**
5. **Redeploy** โปรเจคเพื่อให้ตัวแปรมีผล

---

### **ขั้นตอนที่ 4: Seed Database (ครั้งแรก)**

หลังจาก deploy สำเร็จ คุณต้อง seed ข้อมูลสินค้าเข้า MongoDB:

```bash
# Clone โปรเจคลงเครื่อง (ถ้ายังไม่มี)
git clone https://github.com/xenodeve/Hype-Macro_Store.git
cd Hype-Macro_Store/Nestjs

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env และใส่ MONGODB_URI จาก MongoDB Atlas
echo "MONGODB_URI=mongodb+srv://..." > .env

# รัน seeder
npm run seed
```

---

## ✅ ตรวจสอบการ Deploy

### **1. ตรวจสอบ Frontend**
- เปิด URL ที่ Vercel ให้มา (เช่น `https://your-app.vercel.app`)
- ตรวจสอบว่าหน้าเว็บโหลดได้ปกติ
- ตรวจสอบว่า routing ทำงานถูกต้อง (ลอง refresh หน้า `/login`)

### **2. ตรวจสอบ Backend API**
```bash
# ทดสอบ API endpoint
curl https://your-app.vercel.app/api/products

# ควรได้ response เป็น JSON array ของสินค้า
```

### **3. ตรวจสอบ Authentication**
- ลองสมัครสมาชิกใหม่
- ลอง login
- ตรวจสอบว่า JWT token ทำงานถูกต้อง

### **4. ตรวจสอบ CORS**
- เปิด Browser DevTools → Console
- ตรวจสอบว่าไม่มี CORS errors

---

## 🐛 การแก้ไขปัญหา

### **ปัญหา: API ไม่ทำงาน (404 Not Found)**

**สาเหตุ:** Routing configuration ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่าไฟล์ `vercel.json` อยู่ใน root directory
2. ตรวจสอบว่าโฟลเดอร์ `api/` มีไฟล์ `index.ts`
3. ลอง redeploy โปรเจค

---

### **ปัญหา: MongoDB Connection Failed**

**สาเหตุ:** Connection string ไม่ถูกต้องหรือ IP ไม่ได้รับอนุญาต

**วิธีแก้:**
1. ตรวจสอบ `MONGODB_URI` ใน Vercel Environment Variables
2. ไปที่ MongoDB Atlas → Network Access
3. เพิ่ม IP `0.0.0.0/0` (Allow access from anywhere)
4. ตรวจสอบว่า username/password ถูกต้อง
5. Redeploy โปรเจค

---

### **ปัญหา: CORS Error**

**สาเหตุ:** `FRONTEND_URL` ไม่ตรงกับ URL จริง

**วิธีแก้:**
1. ไปที่ Vercel → Settings → Environment Variables
2. แก้ไข `FRONTEND_URL` ให้ตรงกับ URL ที่ Vercel ให้มา
3. Redeploy โปรเจค

---

### **ปัญหา: Build Failed**

**สาเหตุ:** Dependencies หรือ TypeScript errors

**วิธีแก้:**
1. ตรวจสอบ Build Logs ใน Vercel Dashboard
2. ลองรัน build locally:
   ```bash
   cd React
   npm run build
   
   cd ../Nestjs
   npm run build
   ```
3. แก้ไข errors ที่เจอ
4. Push code และ redeploy

---

### **ปัญหา: Environment Variables ไม่ทำงาน**

**วิธีแก้:**
1. ตรวจสอบว่าตั้งค่าครบทุกตัว
2. ตรวจสอบว่าเลือก Environment ถูกต้อง (Production/Preview/Development)
3. **Redeploy โปรเจค** (สำคัญมาก!)

---

## 📊 ข้อจำกัดของ Vercel

### **Serverless Functions**
- **Execution Time**: 
  - Free plan: 10 วินาที
  - Pro plan: 60 วินาที
- **Memory**: 1024 MB (Free), 3008 MB (Pro)
- **Payload Size**: 4.5 MB (Request), 4.5 MB (Response)

### **File Upload**
- ไม่สามารถเก็บไฟล์ใน filesystem ได้ (Serverless ไม่มี persistent storage)
- ควรใช้ cloud storage เช่น:
  - [Cloudinary](https://cloudinary.com/) (แนะนำ)
  - [AWS S3](https://aws.amazon.com/s3/)
  - [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

### **Cold Start**
- Serverless functions อาจมี "cold start" (ช้าในครั้งแรก)
- หลังจากไม่มีการใช้งาน ~5 นาที function จะ sleep

---

## 🔄 การอัปเดตโปรเจค

### **อัปเดตผ่าน Git (แนะนำ)**
```bash
# แก้ไข code
git add .
git commit -m "Update features"
git push origin main

# Vercel จะ auto-deploy ให้อัตโนมัติ
```

### **อัปเดตผ่าน Vercel CLI**
```bash
vercel --prod
```

---

## 📱 Custom Domain (ถ้าต้องการ)

1. ไปที่ Vercel Dashboard → Settings → Domains
2. คลิก **Add Domain**
3. ใส่ domain name (เช่น `hype-macro.com`)
4. ตั้งค่า DNS ตามที่ Vercel แนะนำ
5. รอ DNS propagate (~24 ชั่วโมง)

---

## 🎯 Best Practices

### **1. ใช้ Environment Variables**
- ไม่ควร hardcode sensitive data ใน code
- ใช้ `.env.example` เป็นตัวอย่าง

### **2. ตั้งค่า CORS อย่างถูกต้อง**
- ระบุ `FRONTEND_URL` ที่ชัดเจน
- ไม่ควรใช้ `*` ใน production

### **3. Monitor Logs**
- ตรวจสอบ logs ใน Vercel Dashboard → Deployments → View Function Logs
- ใช้ `console.log()` เพื่อ debug

### **4. Optimize Build**
- ลบ dependencies ที่ไม่ได้ใช้
- ใช้ `npm prune --production`

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Serverless](https://docs.nestjs.com/faq/serverless)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 🆘 ต้องการความช่วยเหลือ?

- 📧 [Vercel Support](https://vercel.com/support)
- 💬 [Vercel Discord](https://vercel.com/discord)
- 🐛 [Report Issues](https://github.com/xenodeve/Hype-Macro_Store/issues)

---

**สร้างโดย:** Xeno | Full-Stack Developer  
**อัปเดตล่าสุด:** 2025-11-29  
**Version:** 1.0.0
