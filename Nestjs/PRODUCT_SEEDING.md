# 📦 Product Seeding System

## ✅ สิ่งที่สร้างเรียบร้อยแล้ว

### 1. **Product Seeder** (`Nestjs/src/database/seeders/product.seeder.ts`)
- เช็คว่ามีสินค้าใน database อยู่แล้วหรือไม่
- ถ้าไม่มี จะเพิ่ม 4 สินค้า mock เข้าไป
- ถ้ามีอยู่แล้ว จะข้ามการ seed (ไม่ซ้ำ)

### 2. **Database Module** (`Nestjs/src/database/database.module.ts`)
- Module สำหรับจัดการ database operations
- Export ProductSeeder เพื่อใช้งาน

### 3. **Integration** 
- แก้ไข `app.module.ts`: เพิ่ม DatabaseModule
- แก้ไข `main.ts`: รัน seeder ทุกครั้งที่ start server

## 🎯 Mock Products ที่จะถูก Seed

```typescript
[
  {
    name: 'VXE R1 Pro Max',
    description: 'High-performance wireless gaming mouse with 8K polling rate',
    price: 2990,
    image: 'https://ik.imagekit.io/xenodev/Mini%20Project/VXE%20R1%20Pro%20Max?updatedAt=1756072064850',
    stock: 50,
  },
  {
    name: 'VXE R1 Pro',
    description: 'Professional wireless gaming mouse with precision sensor',
    price: 1990,
    image: 'https://ik.imagekit.io/xenodev/Mini%20Project/VXE%20R1%20Pro%20v2?updatedAt=1756071791492',
    stock: 100,
  },
  {
    name: 'Red Square x VXE R1 SE+',
    description: 'Limited edition collaboration gaming mouse',
    price: 990,
    image: 'https://ik.imagekit.io/xenodev/Mini%20Project/Red%20Square%20x%20VXE%20R1%20SE+%20Black%20no%20text?updatedAt=1756071241251',
    stock: 30,
  },
  {
    name: 'Dark Project x VXE R1 Pro Max',
    description: 'Premium collaboration gaming mouse with exclusive design',
    price: 3990,
    image: 'https://ik.imagekit.io/xenodev/Mini%20Project/Dark%20Project%20x%20VXE%20R1%20Pro%20Max?updatedAt=1756069833997',
    stock: 20,
  },
]
```

## 🚀 วิธีใช้งาน

### ครั้งแรก (Database ว่าง):
```bash
cd Nestjs
npm run start:dev
```

**ผลลัพธ์ที่ Console:**
```
✅ MongoDB connected successfully to database: hype-macro
✅ Successfully seeded 4 products!
  - VXE R1 Pro Max (2990 THB)
  - VXE R1 Pro (1990 THB)
  - Red Square x VXE R1 SE+ (990 THB)
  - Dark Project x VXE R1 Pro Max (3990 THB)
🚀 Server running on http://localhost:3000
```

### ครั้งต่อไป (มีข้อมูลแล้ว):
```bash
cd Nestjs
npm run start:dev
```

**ผลลัพธ์ที่ Console:**
```
✅ MongoDB connected successfully to database: hype-macro
📦 Products already exist (4 products). Skipping seed.
🚀 Server running on http://localhost:3000
```

## 🔄 การทำงาน

1. **Server Start** → เชื่อมต่อ MongoDB
2. **Check Products** → นับจำนวนสินค้าใน collection `products`
3. **Seed Logic**:
   - ถ้า `count === 0` → เพิ่มสินค้า 4 รายการ
   - ถ้า `count > 0` → ข้ามการ seed
4. **Server Ready** → พร้อมใช้งาน

## 📊 Database Schema

Collection: `products`

```json
{
  "_id": ObjectId("..."),
  "name": "VXE R1 Pro Max",
  "description": "High-performance wireless gaming mouse with 8K polling rate",
  "price": 2990,
  "image": "https://ik.imagekit.io/xenodev/...",
  "stock": 50,
  "createdAt": "2025-11-01T...",
  "updatedAt": "2025-11-01T..."
}
```

## 🧪 การทดสอบ

### 1. ทดสอบ Seed ครั้งแรก:
```bash
# ลบข้อมูลเดิม (ใน MongoDB Compass หรือ CLI)
# หรือใช้คำสั่ง:
# mongosh
# use hype-macro
# db.products.deleteMany({})

# รัน server
npm run start:dev

# ควรเห็นข้อความ: "Successfully seeded 4 products!"
```

### 2. ทดสอบไม่ Seed ซ้ำ:
```bash
# รัน server อีกครั้ง
npm run start:dev

# ควรเห็นข้อความ: "Products already exist (4 products). Skipping seed."
```

### 3. ทดสอบ Frontend:
```bash
# เปิด React app
cd React
npm run dev

# ไปที่ http://localhost:5173
# สินค้าควรแสดงทั้ง 4 รายการจาก database
```

## 📂 ไฟล์ที่สร้าง/แก้ไข

### สร้างใหม่:
1. ✨ `Nestjs/src/database/seeders/product.seeder.ts`
2. ✨ `Nestjs/src/database/database.module.ts`

### แก้ไข:
3. 🔧 `Nestjs/src/app.module.ts` - เพิ่ม DatabaseModule
4. 🔧 `Nestjs/src/main.ts` - เพิ่มการรัน seeder

## ⚙️ Features

✅ **Auto-seed on startup** - ไม่ต้องรัน script แยก  
✅ **Idempotent** - ไม่ seed ซ้ำถ้ามีข้อมูลแล้ว  
✅ **Logging** - แสดงสถานะการ seed ชัดเจน  
✅ **MongoDB Auto-create** - สร้าง collection อัตโนมัติ  
✅ **Full product data** - รวม description และ stock

## 🔧 การปรับแต่ง

### เพิ่มสินค้าใหม่:
แก้ไข `product.seeder.ts` ใน array `mockProducts`

### Force Re-seed:
ลบข้อมูลใน MongoDB:
```bash
mongosh
use hype-macro
db.products.deleteMany({})
```
จากนั้น restart server

### Disable Auto-seed:
Comment บรรทัดใน `main.ts`:
```typescript
// await productSeeder.seed();
```

---

**สถานะ**: ✅ **พร้อมใช้งาน** - ระบบ seed products อัตโนมัติเมื่อ start server!
